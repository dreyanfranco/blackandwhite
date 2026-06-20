import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Lightweight write-protection: any request must carry the shared team PIN
 * in the `x-team-pin` header. Read endpoints are left open.
 */
@Injectable()
export class TeamPinGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.header('x-team-pin');
    const expected = this.config.get<string>('TEAM_PIN');

    if (!expected) {
      // No PIN configured — treat the API as locked rather than wide open.
      throw new UnauthorizedException('Team PIN is not configured on the server');
    }
    if (provided !== expected) {
      throw new UnauthorizedException('Invalid or missing team PIN');
    }
    return true;
  }
}
