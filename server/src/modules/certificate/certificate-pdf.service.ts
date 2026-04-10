import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@aws-sdk/client-s3';

export interface CertificatePdfData {
  certificateId: string;
  recipientName: string;
  courseTitle: string;
  instructorName: string;
  issuedDate: string; // 'MMMM DD, YYYY'
  courseThumbnailUrl?: string;
  verifyUrl: string;
}

@Injectable()
export class CertificatePdfService {
  private readonly logger = new Logger(CertificatePdfService.name);
  private readonly s3: S3;
  private readonly bucket: string;
  private readonly cdnBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('aws.s3.publicBucket') || '';
    this.cdnBaseUrl = this.configService.get<string>('cdn.baseUrl') || '';

    const endpoint = this.configService.get<string>('aws.s3.endpoint');
    this.s3 = new S3({
      region: this.configService.get<string>('aws.s3.region') || 'ru-central1',
      endpoint,
      credentials: {
        accessKeyId: this.configService.get<string>('aws.s3.accessKeyId') || '',
        secretAccessKey:
          this.configService.get<string>('aws.s3.secretAccessKey') || '',
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  /**
   * Generate a PDF for the given certificate data and upload to S3.
   * Returns the public URL of the uploaded PDF.
   */
  async generateAndUpload(data: CertificatePdfData): Promise<string> {
    this.logger.log(`Generating PDF for certificate ${data.certificateId}`);

    const html = this.buildHtml(data);
    const pdfBuffer = await this.renderPdf(html);
    const url = await this.uploadToS3(data.certificateId, pdfBuffer);

    this.logger.log(
      `PDF uploaded for certificate ${data.certificateId}: ${url}`,
    );
    return url;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async renderPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private async uploadToS3(
    certificateId: string,
    pdfBuffer: Buffer,
  ): Promise<string> {
    const key = `certificates/${certificateId}.pdf`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read',
    });

    await this.s3.send(command);

    // Return CDN or direct S3 URL
    const baseUrl =
      this.cdnBaseUrl ||
      `https://${this.bucket}.${this.configService.get<string>('aws.s3.endpoint')?.replace('https://', '') || 'storage.yandexcloud.net'}`;
    return `${baseUrl}/${key}`;
  }

  private buildHtml(data: CertificatePdfData): string {
    const {
      recipientName,
      courseTitle,
      instructorName,
      issuedDate,
      courseThumbnailUrl,
      verifyUrl,
      certificateId,
    } = data;

    const thumbnailHtml = courseThumbnailUrl
      ? `<img src="${courseThumbnailUrl}" alt="${courseTitle}" style="height:80px;object-fit:contain;border-radius:8px;opacity:0.85;" />`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 297mm;
      height: 210mm;
      font-family: 'Inter', sans-serif;
      background: #fff;
      display: flex;
      align-items: stretch;
    }

    .certificate {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Gold decorative bars */
    .bar-top {
      height: 12px;
      background: linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b);
    }
    .bar-bottom {
      height: 12px;
      background: linear-gradient(90deg, #f59e0b, #fde68a, #f59e0b);
      margin-top: auto;
    }

    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 72px;
      background: linear-gradient(135deg, #fffbeb 0%, #fffdf5 60%, #fef9ec 100%);
      gap: 16px;
      position: relative;
    }

    /* Decorative corner circles */
    .body::before, .body::after {
      content: '';
      position: absolute;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      border: 1.5px solid #fde68a;
      opacity: 0.5;
    }
    .body::before { top: -80px; left: -80px; }
    .body::after  { bottom: -80px; right: -80px; }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: 0.05em;
    }
    .brand-icon { font-size: 22px; }

    .label {
      font-size: 10px;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: #d97706;
      font-weight: 700;
    }

    .headline {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      color: #111827;
    }

    .recipient-wrap {
      position: relative;
      padding: 6px 48px;
    }
    .recipient-wrap::before,
    .recipient-wrap::after {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40%;
      height: 1px;
      background: linear-gradient(to right, transparent, #d97706);
    }
    .recipient-wrap::before { right: 100%; }
    .recipient-wrap::after {
      left: 100%;
      background: linear-gradient(to left, transparent, #d97706);
    }

    .recipient {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 36px;
      color: #d97706;
    }

    .course-label { font-size: 13px; color: #6b7280; }
    .course-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      text-align: center;
    }

    .instructor { font-size: 12px; color: #6b7280; }
    .instructor strong { color: #374151; font-weight: 600; }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      border-top: 1px solid #fde68a;
      padding-top: 14px;
      margin-top: 4px;
    }

    .sig-block { text-align: center; min-width: 130px; }
    .sig-line { height: 1px; width: 100%; background: #9ca3af; margin-bottom: 4px; }
    .sig-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }
    .sig-name  { font-size: 11px; font-weight: 600; color: #374151; }

    .verify-block {
      text-align: center;
      font-size: 9px;
      color: #6b7280;
    }
    .verify-block .check { font-size: 22px; color: #10b981; }
    .verify-block strong { display: block; color: #10b981; font-size: 11px; font-weight: 700; }
    .verify-block code { font-family: monospace; font-size: 8px; color: #9ca3af; display: block; margin-top: 2px; }
  </style>
</head>
<body>
<div class="certificate">
  <div class="bar-top"></div>

  <div class="body">
    <!-- Brand -->
    <div class="brand">
      <span class="brand-icon">🏆</span>
      LearnHub
    </div>

    <!-- Subtitle label -->
    <div class="label">Certificate of Completion</div>

    <div class="headline">This certifies that</div>

    <!-- Recipient -->
    <div class="recipient-wrap">
      <div class="recipient">${recipientName}</div>
    </div>

    <div class="course-label">has successfully completed the course</div>
    <div class="course-title">${courseTitle}</div>
    ${instructorName ? `<div class="instructor">Taught by <strong>${instructorName}</strong></div>` : ''}
    ${thumbnailHtml}

    <!-- Footer -->
    <div class="footer">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Date Issued</div>
        <div class="sig-name">${issuedDate}</div>
      </div>

      <div class="verify-block">
        <div class="check">✅</div>
        <strong>Verified by LearnHub</strong>
        <span>${verifyUrl}</span>
        <code>ID: ${certificateId}</code>
      </div>

      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Authorized Signature</div>
        <div class="sig-name">LearnHub Team</div>
      </div>
    </div>
  </div>

  <div class="bar-bottom"></div>
</div>
</body>
</html>`;
  }
}
