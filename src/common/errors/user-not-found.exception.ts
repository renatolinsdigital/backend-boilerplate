import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId?: number | string) {
    super(`User${userId ? ` with ID ${userId}` : ''} not found`);
    this.name = 'UserNotFoundException';
  }
}
