<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# rất tốt, bây giờ tôi muốn hệ thống lại tất cả các bước, follow hoạt động, endpoints, models cả FE, BE, AWS để tôi có thể vibe coding với ai agent

Dưới đây là bản “blueprint” tổng thể: **flow hoạt động**, **model**, **endpoint** cho FE, BE (NestJS), AWS – đủ để bạn đưa cho AI/coder khác và bắt đầu implement từng phần.

---

## 1. Kiến trúc \& Flow tổng quát

### 1.1. Mục tiêu

- Upload **nhiều image/video** từ Next.js → S3 bằng **presigned URL**.
- Video được xử lý HLS bằng MediaConvert, lưu output lên S3.
- **Video gốc bị xóa** sau khi HLS xong.
- Prisma + PostgreSQL lưu metadata; FE hiển thị list + player HLS.

### 1.2. Flow end-to-end

1. User chọn nhiều file trên UI (Next.js).
2. FE validate type/size (lọc image/video hợp lệ).
3. FE gửi metadata list → NestJS (`POST /media/presigned`).
4. NestJS:
   - Tạo record `Media` cho từng file (status = UPLOADING).
   - Generate S3 **presigned PUT URL** cho từng file (bucket `raw-uploads`, key `raw/<uuid>...`).
   - Trả về list `{ mediaId, uploadUrl, key, type }`.
5. FE dùng các `uploadUrl` upload file trực tiếp lên S3 (song song), tracking progress.
6. Mỗi file upload xong:
   - FE gọi `POST /media/upload-complete` với `mediaId`.
   - BE:
     - Nếu IMAGE: `status = COMPLETED`, `storageKey = rawKey`.
     - Nếu VIDEO: `status = PROCESSING`, chờ pipeline HLS.
7. AWS S3 (bucket raw-uploads) có video mới:
   - S3 Event → **Lambda 1** → tạo MediaConvert job (input: raw key, output: processed-videos).
8. MediaConvert encode HLS:
   - Output: `processed-videos/videos/<jobId>/playlist.m3u8`, thumbnails…
   - Khi job xong → EventBridge / SNS → **Lambda 2**.
9. Lambda 2:
   - Xóa video gốc (DeleteObject `raw-uploads/raw/...`).
   - Gọi HTTP về NestJS `POST /media/video-processed` với:
     - `mediaId`, `playlistKey`, `thumbnailKey?`, `duration?`.
10. NestJS update DB:
    - `hlsPlaylistKey = playlistKey`, `thumbnailKey`, `duration`.
    - `storageKey = thumbnailKey || playlistKey`.
    - `status = COMPLETED`.
11. FE:
    - Polling hoặc subscribe để lấy danh sách media.
    - Với image: dùng `cdnBaseUrl + storageKey`.
    - Với video: thumbnail = `cdnBaseUrl + (thumbnailKey || storageKey)`, stream URL = `cdnBaseUrl + hlsPlaylistKey` qua vidstack.io.

---

## 2. Database \& Prisma models (PostgreSQL)

```prisma


model Media {
  id        String      @id @default(cuid())
  userId    String

  // Thông tin upload
  filename  String
  size      BigInt
  mimetype  String      // image/jpeg, video/mp4, ...

  // Phân loại
  type      MediaType   // IMAGE | VIDEO

  // Storage / CDN
  storageKey     String      @unique  // key chính dùng cho UI (ảnh hoặc thumbnail)
  thumbnailKey   String?     // cho video (hoặc ảnh nếu muốn)
  cdnBaseUrl     String      // ví dụ: https://cdn.example.com

  // Video HLS
  hlsPlaylistKey String?     // videos/abc123/playlist.m3u8
  duration       Float?      // seconds

  status         MediaStatus @default(PROCESSING)

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  user           User        @relation(fields: [userId], references: [id])

  @@map("media_items")
}

enum MediaType {
  IMAGE
  VIDEO
}

enum MediaStatus {
  UPLOADING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 3. Backend NestJS – endpoints \& function

### 3.1. S3Service – tạo presigned URL

```ts
// s3.service.ts
@Injectable()
export class S3Service {
  private s3: S3Client;
  private rawBucket = this.config.get<string>('AWS_RAW_BUCKET');

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async generateUploadUrl(filename: string, mimetype: string) {
    const ext = filename.split('.').pop();
    const key = `raw/${uuid()}-${Date.now()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.rawBucket,
      Key: key,
      ContentType: mimetype,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 600 });
    return { url, key };
  }
}
```

### 3.2. DTO

```ts
// dto/request-presigned.dto.ts
export class RequestPresignedDto {
  files: {
    filename: string;
    mimetype: string;
    size: number;
  }[];
}
```

### 3.3. MediaService

```ts
// media.service.ts
@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private config: ConfigService,
  ) {}

  async createPresignedForMany(userId: string, dto: RequestPresignedDto) {
    const cdnBaseUrl = this.config.get<string>('CDN_BASE_URL');

    const results = await Promise.all(
      dto.files.map(async (file) => {
        const type: MediaType = file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO';

        const { url, key } = await this.s3Service.generateUploadUrl(file.filename, file.mimetype);

        const media = await this.prisma.media.create({
          data: {
            userId,
            filename: file.filename,
            size: BigInt(file.size),
            mimetype: file.mimetype,
            type,
            storageKey: key, // tạm: raw key
            cdnBaseUrl,
            status: 'UPLOADING',
          },
        });

        return {
          mediaId: media.id,
          uploadUrl: url,
          key,
          type,
        };
      }),
    );

    return results;
  }

  async markUploadComplete(mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException();

    if (media.type === 'IMAGE') {
      // Image dùng luôn raw file
      return this.prisma.media.update({
        where: { id: mediaId },
        data: {
          status: 'COMPLETED',
          storageKey: media.storageKey,
        },
      });
    }

    // VIDEO: chờ HLS
    return this.prisma.media.update({
      where: { id: mediaId },
      data: { status: 'PROCESSING' },
    });
  }

  async markVideoProcessed(input: {
    mediaId: string;
    playlistKey: string;
    thumbnailKey?: string;
    duration?: number;
  }) {
    const { mediaId, playlistKey, thumbnailKey, duration } = input;

    return this.prisma.media.update({
      where: { id: mediaId },
      data: {
        hlsPlaylistKey: playlistKey,
        thumbnailKey: thumbnailKey ?? null,
        duration: duration ?? null,
        storageKey: thumbnailKey ?? playlistKey,
        status: 'COMPLETED',
      },
    });
  }

  async listMyMedia(userId: string) {
    return this.prisma.media.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### 3.4. MediaController

```ts
// media.controller.ts
@Controller('media')
@UseGuards(AuthGuard) // tuỳ auth
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('presigned')
  async getPresigned(@Req() req, @Body() dto: RequestPresignedDto) {
    const userId = req.user.id;
    return this.mediaService.createPresignedForMany(userId, dto);
  }

  @Post('upload-complete')
  async uploadComplete(@Body() body: { mediaId: string }) {
    await this.mediaService.markUploadComplete(body.mediaId);
    return { success: true };
  }

  // Lambda gọi khi HLS xong
  @Post('video-processed')
  async videoProcessed(
    @Body()
    body: {
      mediaId: string;
      playlistKey: string;
      thumbnailKey?: string;
      duration?: number;
    },
  ) {
    const media = await this.mediaService.markVideoProcessed(body);
    return { success: true, media };
  }

  @Get('my')
  async myMedia(@Req() req) {
    const userId = req.user.id;
    return this.mediaService.listMyMedia(userId);
  }
}
```

---

## 4. AWS side – S3, Lambda, MediaConvert

### 4.1. Buckets

- `raw-uploads`
  - Nhận upload trực tiếp từ FE (video/image gốc).
- `processed-videos`
  - Nhận HLS output từ MediaConvert (`videos/<jobId>/...`).

### 4.2. Lambda 1 – Trigger từ S3 raw

- Event: ObjectCreated từ `raw-uploads/raw/`.
- Task:
  - Nếu `ContentType` bắt đầu `video/`:
    - Tạo MediaConvert job:
      - Input: `s3://raw-uploads/<rawKey>`.
      - Output: `s3://processed-videos/videos/<jobId>/playlist.m3u8`.
    - Gắn `mediaId` làm tag/metadata trong job để dùng về sau.

### 4.3. MediaConvert job → Lambda 2

- Event: MediaConvert Job Complete (EventBridge / SNS).
- Lambda 2:
  - Đọc job info: input key (raw), output keys (playlist, thumbnails).
  - Xóa `raw-uploads/<rawKey>`.
  - Gọi HTTP tới NestJS:

```http
POST https://your-backend/media/video-processed
Content-Type: application/json

{
  "mediaId": "...",             // lấy từ job metadata
  "playlistKey": "videos/jobId/playlist.m3u8",
  "thumbnailKey": "videos/jobId/thumbnail.jpg",
  "duration": 123.45
}
```

---

## 5. Frontend Next.js – hooks \& function

### 5.1. validateFiles

- Kiểm tra `mimetype` + `size` trước khi gửi metadata xuống BE.

### 5.2. requestPresignedUrls

```ts
async function requestPresignedUrls(validFiles: File[]) {
  const res = await fetch('/api/media/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: validFiles.map((f) => ({
        filename: f.name,
        mimetype: f.type,
        size: f.size,
      })),
    }),
  });

  if (!res.ok) throw new Error('Cannot get presigned urls');
  return res.json() as Promise<
    {
      mediaId: string;
      uploadUrl: string;
      key: string;
      type: 'IMAGE' | 'VIDEO';
    }[]
  >;
}
```

### 5.3. uploadFilesToS3

```ts
async function uploadFilesToS3(
  files: File[],
  presigned: { mediaId: string; uploadUrl: string }[],
  onProgress: (mediaId: string, percent: number) => void,
) {
  const tasks = presigned.map((item, idx) => {
    const file = files[idx];
    return axios.put(item.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => {
        if (!e.total) return;
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(item.mediaId, percent);
      },
    });
  });

  return Promise.allSettled(tasks);
}
```

### 5.4. notifyUploadComplete

```ts
async function notifyUploadComplete(mediaId: string) {
  await fetch('/api/media/upload-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaId }),
  });
}
```

### 5.5. Hook `useMultiUpload`

- Ghép 4 bước: validate → requestPresigned → uploadToS3 → notify.

---

## 6. FE hiển thị media

### 6.1. Lấy list media

```ts
async function fetchMyMedia() {
  const res = await fetch('/api/media/my');
  return res.json(); // list Media
}
```

### 6.2. Build URL từ model

```ts
const buildUrl = (base: string, key?: string | null) => (key ? `${base}/${key}` : null);

const isImage = (item: Media) => item.type === 'IMAGE';
const isVideo = (item: Media) => item.type === 'VIDEO';

const mediaUrl = (item: Media) => buildUrl(item.cdnBaseUrl, item.storageKey);
const thumbUrl = (item: Media) => buildUrl(item.cdnBaseUrl, item.thumbnailKey ?? item.storageKey);
const hlsUrl = (item: Media) => buildUrl(item.cdnBaseUrl, item.hlsPlaylistKey);
```

- Image: `<img src={mediaUrl(item)} />`.
- Video list: `<img src={thumbUrl(item)} />`.
- Video player: dùng `hlsUrl(item)` với vidstack.io.

---
