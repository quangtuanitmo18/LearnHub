import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const mailConfig = this.configService.get('mail');

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    });

    // Verify connection on startup (non-blocking)
    this.transporter.verify((error) => {
      if (error) {
        this.logger.warn(
          `Email transporter verification failed: ${error.message}`,
        );
        this.logger.warn(
          'Email sending will be disabled until configuration is fixed',
        );
      } else {
        this.logger.log('Email transporter is ready to send emails');
      }
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: EmailAttachment[];
  }): Promise<boolean> {
    const mailConfig = this.configService.get('mail');

    // Check if mail is configured
    if (!mailConfig.user || !mailConfig.password) {
      this.logger.warn('Email credentials not configured, skipping email send');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${mailConfig.fromName}" <${mailConfig.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType || 'application/pdf',
        })),
      });

      this.logger.log(
        `Email sent successfully to ${options.to}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Check if email service is properly configured
   */
  isConfigured(): boolean {
    const mailConfig = this.configService.get('mail');
    return !!(mailConfig.user && mailConfig.password);
  }
}
