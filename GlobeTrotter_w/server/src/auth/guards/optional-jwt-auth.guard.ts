import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw an error when no user is found
  handleRequest(err: any, user: any) {
    // Don't throw error if no user (no token provided)
    // Just return undefined user, which means unauthenticated access
    return user;
  }
}
