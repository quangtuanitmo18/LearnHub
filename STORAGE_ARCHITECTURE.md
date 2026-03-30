# Storage Architecture & Video Streaming (LearnHub)

This document outlines the complete storage and video streaming (HLS) mechanisms in the LearnHub project. To prevent data loss when server instances (e.g., Render, Vercel) restart or deploy, **no media files are stored locally on the Backend server**.

We utilize a dual-system approach for different types of media:

1. **UploadThing:** Used for static images (Avatars, Course Thumbnails, etc.).
2. **Yandex Cloud Storage (AWS S3 Compatible) + HLS MediaConvert:** Used for storing and streaming large video lectures.

---

## 1. Static Image Storage (UploadThing)

- **Purpose:** Store lightweight images that upload quickly and don't require complex background processing.
- **Integration Point:** Utilizes the `<ImageUpload />` or `<ImageUploadSimple />` components on the Frontend.
- **Workflow:**
  - The Frontend securely uploads directly to the UploadThing servers using the `UPLOADTHING_TOKEN`.
  - Upon successful upload, UploadThing returns a direct text URL.
  - The Frontend passes this URL to the Backend to be saved in the database (e.g., as `avatar` or `thumbnail`).

---

## 2. Video Storage & HLS Streaming (S3 Presigned URLs)

- **Purpose:** Allow users to upload massive video files directly to Cloud Storage (saving 100% of Backend bandwidth) and automatically convert them into HLS format for piracy protection and adaptive streaming (adjusting quality based on the learner's internet speed).
- **End-to-End Workflow (Blueprint):**

### Step 1: Upload Initialization (FE -> BE)

- The user selects a video file on the client interface. The Frontend validates the file size and mimetype.
- The Frontend calls the API `POST /media/presigned`.
- **Backend (NestJS) Processing:**
  - Creates a `Media` record in the database with the status `UPLOADING`.
  - Generates a short-lived **Presigned PUT URL** (valid for ~10 minutes) pointing to the `raw-uploads` S3 bucket.
  - Returns this URL to the Frontend.

### Step 2: Direct Upload (FE -> S3)

- The user's browser uses multiple concurrent connections to upload (PUT) the big video file **directly to Yandex Cloud / S3** using the Presigned URL.
- The Backend consumes absolutely zero bandwidth during this transfer.
- Once the upload finishes, the Frontend notifies the Backend via `POST /media/upload-complete`.
- The Backend updates the media record status to `PROCESSING`.

### Step 3: Background HLS Processing (AWS Lambda & MediaConvert)

- The moment the video lands in the `raw-uploads` S3 bucket:
  - An S3 Event triggers **Lambda 1**.
  - Lambda 1 dispatches a job to **AWS MediaConvert** to transcode the original `.mp4` into HLS streaming format (`.m3u8` playlist and multiple resolution segments).
  - The processed video chunks are output to a new bucket named `processed-videos`.
- Once MediaConvert finishes the job:
  - An event triggers **Lambda 2**.
  - Lambda 2 immediately **DELETES the original video** from the `raw-uploads` bucket to save storage costs.
  - Lambda 2 sends an HTTP Request back to the NestJS Backend (`POST /media/video-processed`).

### Step 4: Completion & Serving (BE -> FE)

- Upon receiving the webhook from Lambda 2, NestJS updates the Database:
  - Sets `hlsPlaylistKey` to the `.m3u8` file path.
  - Sets `thumbnailKey` to the auto-generated video thumbnail.
  - Updates the status to `COMPLETED`.
- On the Frontend, a video player (like `vidstack.io`) is used to smoothly stream the `.m3u8` file.

---

## 3. Database Model (Prisma)

The core data model handling this S3 mechanism is `Media`:

```prisma
model Media {
  id             String      @id @default(uuid())
  userId         String
  filename       String
  size           BigInt
  mimetype       String      // image/jpeg, video/mp4
  type           MediaType   // IMAGE | VIDEO

  // Stores the direct image link or raw video key (rarely used for viewing video)
  storageKey     String      @unique
  // Stores the path to the .m3u8 file (HLS Playlist)
  hlsPlaylistKey String?

  // CDN Base URL (e.g., https://storage.yandexcloud.net/learnhub)
  cdnBaseUrl     String

  status         MediaStatus @default(UPLOADING) // UPLOADING -> PROCESSING -> COMPLETED

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  user           User        @relation(fields: [userId], references: [id])
}
```

---

## 4. Key Backend Endpoints

- `POST /media/presigned`: Generates a one-time URL for direct client-to-S3 uploading.
- `POST /media/upload-complete`: Webhook from Frontend to signal that the S3 upload is finished.
- `POST /media/video-processed`: Webhook from AWS Lambda to signal that the HLS packaging is complete.
- `GET /media/my`: Lists all media files uploaded by the current user.

**Summary:** All the heavy lifting is offloaded to a Serverless architecture (S3, Lambda, MediaConvert). The Backend purely acts as an authorization gatekeeper and database tracker!
