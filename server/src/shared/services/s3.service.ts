import {
  S3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

@Injectable()
export class S3Service {
  private s3: S3;
  private readonly logger = new Logger(S3Service.name);
  private readonly publicBucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region =
      this.configService.get<string>('aws.s3.region') || 'ru-central1';
    this.publicBucket =
      this.configService.get<string>('aws.s3.publicBucket') || '';

    const endpoint = this.configService.get<string>('aws.s3.endpoint');

    this.s3 = new S3({
      region: this.region,
      endpoint,
      credentials: {
        secretAccessKey:
          this.configService.get<string>('aws.s3.secretAccessKey') || '',
        accessKeyId: this.configService.get<string>('aws.s3.accessKeyId') || '',
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  /**
   * Generate presigned URL for direct client upload
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600, // 1 hour default
  ): Promise<PresignedUrlResponse> {
    const command = new PutObjectCommand({
      Bucket: this.publicBucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });

    this.logger.log(
      `Generated presigned upload URL for key: ${key} in bucket: ${this.publicBucket}`,
    );

    return {
      uploadUrl,
      key,
      expiresIn,
    };
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.publicBucket,
        Key: key,
      });
      await this.s3.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.publicBucket,
      Key: key,
    });

    await this.s3.send(command);
    this.logger.log(`Deleted file from S3: ${key}`);
  }

  /**
   * Delete a folder and all its contents from S3
   */
  async deleteFolder(prefix: string): Promise<void> {
    try {
      let continuationToken: string | undefined = undefined;
      let isTruncated = true;

      while (isTruncated) {
        const listCommand = new ListObjectsV2Command({
          Bucket: this.publicBucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        });

        // Use any because aws-sdk ServiceOutputTypes hides ListObjectsV2CommandOutput fields from TS
        const listResponse = (await this.s3.send(listCommand)) as any;

        if (listResponse.Contents && listResponse.Contents.length > 0) {
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: this.publicBucket,
            Delete: {
              Objects: listResponse.Contents.map((item: any) => ({
                Key: item.Key!,
              })),
            },
          });

          await this.s3.send(deleteCommand);
          this.logger.log(
            `Deleted ${listResponse.Contents.length} objects with prefix: ${prefix}`,
          );
        }

        isTruncated = listResponse.IsTruncated ?? false;
        continuationToken = listResponse.NextContinuationToken;
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete folder ${prefix}: ${(error as Error).message}`,
      );
    }
  }
}
