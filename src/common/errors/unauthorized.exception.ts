import { UnauthorizedException } from '@nestjs/common';

export class CustomUnauthorizedException extends UnauthorizedException {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'CustomUnauthorizedException';
  }
}
