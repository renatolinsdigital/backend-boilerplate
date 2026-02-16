import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { UserNotFoundException } from '../common/errors/user-not-found.exception';
import {
  validateEmail,
  validatePasswordComplexity,
  validateRole,
  validateId,
  validatePagination,
  validateRequiredFields,
} from '../common/validators';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: {
          type: 'string',
          minLength: 8,
          example: 'Password123',
          description: 'Min 8 chars, must include uppercase, lowercase, and number',
        },
        name: { type: 'string', example: 'John Doe' },
        role: {
          type: 'string',
          enum: ['ADMIN', 'STUDENT', 'TEACHER', 'STAFF', 'GUEST'],
          example: 'STUDENT',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async create(
    @Body()
    body: {
      email: string;
      name?: string;
      password: string;
      role?: string;
    },
  ) {
    try {
      // Validate required fields
      const requiredFieldsValidation = validateRequiredFields({
        email: body.email,
        password: body.password,
      });
      if (!requiredFieldsValidation.isValid) {
        throw new BadRequestException(requiredFieldsValidation.message);
      }

      // Normalize and validate email format
      const email = body.email.trim().toLowerCase();
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new BadRequestException(emailValidation.message);
      }

      // Validate password complexity (medium level)
      const passwordValidation = validatePasswordComplexity(body.password);
      if (!passwordValidation.isValid) {
        throw new BadRequestException(passwordValidation.message);
      }

      // Validate role if provided
      if (body.role) {
        const roleValidation = validateRole(body.role);
        if (!roleValidation.isValid) {
          throw new BadRequestException(roleValidation.message);
        }
      }

      const result = await this.usersService.create({
        ...body,
        email, // Use normalized email
      });
      const { password: _password, ...userWithoutPassword } = result;
      return userWithoutPassword;
    } catch (error) {
      // Handle duplicate email error
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Email already in use');
      }

      // Re-throw known exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log the actual error for debugging
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      if (error.code) {
        this.logger.error(`Prisma Error Code: ${error.code}`, error.meta);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (1-1000, default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Returns paginated users list' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid pagination parameters',
  })
  async findbyPage(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    try {
      // Validate pagination parameters
      const paginationValidation = validatePagination(page, limit);
      if (!paginationValidation.isValid) {
        throw new BadRequestException(paginationValidation.message);
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);

      return await this.usersService.findbyPage(pageNum, limitNum);
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error fetching users: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns user details (without password)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid ID format' })
  async findOne(@Param('id') id: string) {
    try {
      // Validate ID parameter
      const idValidation = validateId(id);
      if (!idValidation.isValid) {
        throw new BadRequestException(idValidation.message);
      }

      const userId = Number(id);

      const user = await this.usersService.findOneById(userId);

      if (!user) {
        throw new UserNotFoundException(id);
      }

      const { password: _password, ...result } = user;
      return result;
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof UserNotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error fetching user ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid ID format' })
  async delete(@Param('id') id: string) {
    try {
      // Validate ID parameter
      const idValidation = validateId(id);
      if (!idValidation.isValid) {
        throw new BadRequestException(idValidation.message);
      }

      const userId = Number(id);

      // Check if user exists
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new UserNotFoundException(id);
      }

      await this.usersService.delete(userId);
      return { message: 'User deleted successfully' };
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof UserNotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error deleting user ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
