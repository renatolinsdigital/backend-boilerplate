import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { validateEmail, validateRequiredFields } from '../common/validators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', example: 'Password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT access token',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(@Body() body: { email: string; password: string }) {
    try {
      // Validate required fields
      const requiredFieldsValidation = validateRequiredFields({
        email: body.email,
        password: body.password,
      });
      if (!requiredFieldsValidation.isValid) {
        throw new BadRequestException(requiredFieldsValidation.message);
      }

      // Trim and validate email format
      const email = body.email.trim().toLowerCase();
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new BadRequestException(emailValidation.message);
      }

      // Attempt to login and get JWT token
      const result = await this.authService.login(email, body.password);

      this.logger.log(`User logged in successfully: ${email}`);

      return result;
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Login failed. Please try again later');
    }
  }
}
