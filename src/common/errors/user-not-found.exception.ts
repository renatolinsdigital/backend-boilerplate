import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(_userId?: number | string) {
    // Use generic message to prevent information disclosure about user IDs
    super('Resource not found');
    this.name = 'UserNotFoundException';
  }
}
