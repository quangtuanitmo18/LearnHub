import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SepayWebhookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
      console.log('SepayWebhookGuard - Authorization Header:', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    // Expected format: "Apikey YOUR_API_KEY"
    const [prefix, apiKey] = authHeader.split(' ');

    if (prefix !== 'Apikey') {
      throw new UnauthorizedException('Invalid Authorization format. Expected: Apikey {API_KEY}');
    }

    const expectedApiKey = this.configService.get<string>('payment.sepayApiKey');

    if (!expectedApiKey) {
      throw new UnauthorizedException('SePay API key not configured');
    }

    if (apiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid SePay API key');
    }

    return true;
  }
}
