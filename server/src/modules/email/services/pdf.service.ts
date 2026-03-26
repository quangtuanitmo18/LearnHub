import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ejs from 'ejs';
import * as path from 'path';
import { InvoiceData } from '../interfaces';
import { formatCurrency, formatDate } from '../templates';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly templateDir = path.join(__dirname, '..', 'templates');
  private readonly companyName = 'NestJS Tutorial';

  /**
   * Generate invoice PDF from order data
   */
  async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
    this.logger.log(`Generating invoice PDF for order ${data.orderCode}`);

    let browser: puppeteer.Browser | null = null;

    try {
      // Render HTML from EJS template
      const html = await this.renderInvoiceTemplate(data);

      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Set content and wait for rendering
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      this.logger.log(
        `Invoice PDF generated successfully for order ${data.orderCode}`,
      );

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Failed to generate invoice PDF: ${error.message}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Render invoice HTML template
   */
  private async renderInvoiceTemplate(data: InvoiceData): Promise<string> {
    const templatePath = path.join(this.templateDir, 'invoice.ejs');

    return ejs.renderFile(templatePath, {
      ...data,
      formatCurrency,
      formatDate,
      companyName: this.companyName,
    });
  }
}
