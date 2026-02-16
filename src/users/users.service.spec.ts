import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: 'STUDENT',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneById(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createData = {
        email: 'new@example.com',
        name: 'New User',
        password: 'Password123',
        role: 'STUDENT',
      };

      const hashedPassword = 'hashed_Password123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        ...createData,
        password: hashedPassword,
      });

      const result = await service.create(createData);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createData.email,
          name: createData.name,
          password: hashedPassword,
          role: 'STUDENT',
        },
      });
      expect(result.password).toBe(hashedPassword);
    });

    it('should default to GUEST role when role not provided', async () => {
      const createData = {
        email: 'guest@example.com',
        password: 'Password123',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        ...createData,
        role: 'GUEST',
      });

      await service.create(createData);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'GUEST',
        }),
      });
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'Password123');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashedPassword');
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'Password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('findbyPage', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', createdAt: new Date() },
        { id: 2, email: 'user2@example.com', name: 'User 2', createdAt: new Date() },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(25);

      const result = await service.findbyPage(1, 10);

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        pages: 3,
      });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    });

    it('should calculate correct skip value for different pages', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findbyPage(3, 10);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        select: expect.any(Object),
      });
    });

    it('should use default values when no parameters provided', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findbyPage();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.delete(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
