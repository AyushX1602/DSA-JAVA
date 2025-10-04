import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface SendPasswordResetOtpInput {
  toEmail: string;
  toName?: string;
  otp: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly emailJsServiceId = process.env.EMAILJS_SERVICE_ID;
  private readonly emailJsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  private readonly emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
  private readonly emailJsPrivateKey = process.env.EMAILJS_PRIVATE_KEY;
  private readonly toParam = process.env.EMAILJS_TO_PARAM || 'to_email';
  private readonly otpParam = process.env.EMAILJS_OTP_PARAM || 'passcode';
  private readonly toNameParam = process.env.EMAILJS_TO_NAME_PARAM || 'to_name';

  async sendPasswordResetOtp(input: SendPasswordResetOtpInput): Promise<void> {
    const { toEmail, toName, otp } = input;

    if (
      !this.emailJsServiceId ||
      !this.emailJsTemplateId ||
      !this.emailJsPublicKey ||
      !this.emailJsPrivateKey
    ) {
      this.logger.warn('EmailJS env vars missing; skipping email send');
      return;
    }

    try {
      // EmailJS REST API
      // Docs: https://www.emailjs.com/docs/rest-api/send/
      const url = 'https://api.emailjs.com/api/v1.0/email/send';

      const templateParams: Record<string, string> = {};
      // Recipient email: set configured key and common fallbacks to satisfy template variations
      templateParams[this.toParam] = toEmail;
      templateParams['email'] = toEmail;
      templateParams['to_email'] = toEmail;
      templateParams['to'] = toEmail;
      templateParams['recipient'] = toEmail;

      // Recipient name and OTP
      templateParams[this.toNameParam] = toName ?? toEmail;
      templateParams[this.otpParam] = otp;

      // Optional: provide expiry time if template uses {{time}}
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      templateParams['time'] = expiry.toLocaleString();

      const payload = {
        service_id: this.emailJsServiceId,
        template_id: this.emailJsTemplateId,
        user_id: this.emailJsPublicKey,
        accessToken: this.emailJsPrivateKey,
        template_params: templateParams,
      } as any;

      await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      const responseData = error?.response?.data;
      if (responseData) {
        this.logger.error(
          `EmailJS error response: ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`,
        );
      }
      this.logger.error('Failed to send password reset OTP via EmailJS');
      // swallow error to avoid breaking the request flow
    }
  }
}
