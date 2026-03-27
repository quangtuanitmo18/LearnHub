import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const secret = this.configService.get<string>('jwt.accessSecret');
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // 1. Try Bearer token from Authorization header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    // 2. Fallback: read from HttpOnly cookie
    const cookies = request.cookies || this.parseCookies(request);
    return cookies?.access_token;
  }

  private parseCookies(request: Request): Record<string, string> {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) return {};
    return Object.fromEntries(
      cookieHeader.split(';').map((cookie) => {
        const [key, ...val] = cookie.trim().split('=');
        return [key, val.join('=')];
      }),
    );
  }
}
