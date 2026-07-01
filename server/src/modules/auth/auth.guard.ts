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

import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (isPublic) {
      if (token) {
        try {
          const secret = this.configService.get<string>('jwt.accessSecret');
          const payload = await this.jwtService.verifyAsync(token, {
            secret,
          });

          // Perform database status check
          const user = await this.prismaService.user.findUnique({
            where: { id: payload.sub },
            select: { status: true },
          });
          if (user && user.status === 'ACTIVE') {
            request['user'] = payload;
          }
        } catch {
          // Ignore token validation error for public routes
        }
      }
      return true;
    }

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const secret = this.configService.get<string>('jwt.accessSecret');
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // Perform database status check
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
        select: { status: true },
      });
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Account is not active');
      }

      request['user'] = payload;
    } catch (e) {
      throw new UnauthorizedException(
        e instanceof UnauthorizedException ? e.message : undefined,
      );
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
