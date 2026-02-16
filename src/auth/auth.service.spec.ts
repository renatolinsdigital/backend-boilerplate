import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT',
    password: 'hashedPassword',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockUsersService = {
    validateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockUsersService.validateUser.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'Password123');

      expect(result).toEqual(mockUser);
      expect(usersService.validateUser).toHaveBeenCalledWith('test@example.com', 'Password123');
    });

    it('should return null when credentials are invalid', async () => {
      mockUsersService.validateUser.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(usersService.validateUser).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });
  });

  describe('login', () => {
    it('should return access token and user data on successful login', async () => {
      const mockToken = 'mock.jwt.token';
      mockUsersService.validateUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login('test@example.com', 'Password123');

      expect(result).toEqual({
        access_token: mockToken,
        token_type: 'Bearer',
        expires_in: '7d',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUsersService.validateUser.mockResolvedValue(null);

      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('verifyToken', () => {
    it('should return payload when token is valid', async () => {
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
        role: 'STUDENT',
      };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.verifyToken('valid.jwt.token');

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken('invalid.token')).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyToken('invalid.token')).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.verifyToken('expired.token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
