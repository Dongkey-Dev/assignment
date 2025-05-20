import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, UserSchema } from '@libs/common/schemas/user.schema';
import { AuthService } from '../src/auth/auth.service';
import { CreateUserDto, LoginUserDto } from '@libs/common/dto/auth/user.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeAll(async () => {
    // Create in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to in-memory database
    mongoConnection = (await connect(uri)).connection;

    // Create the test module
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    // Get the models and service
    userModel = module.get<Model<User>>(getModelToken(User.name));
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    try {
      await mongoConnection.close();
      await mongod.stop();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  beforeEach(async () => {
    // Clear the database before each test
    await userModel.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      // Act
      const result = await authService.register(createUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.role).toBe(createUserDto.role);
      expect(result.token).toBe('test-token');

      // Verify user was saved to database
      const savedUser = await userModel
        .findOne({ email: createUserDto.email })
        .exec();
      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe(createUserDto.email);
      expect(savedUser?.role).toBe(createUserDto.role);

      // Verify password was hashed
      const isPasswordValid = await bcrypt.compare(
        createUserDto.password,
        savedUser.password,
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should throw BadRequestException when email already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      // Create a user first
      await authService.register(createUserDto);

      // Act & Assert
      await expect(authService.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'login-test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      // Create a user first
      await authService.register(createUserDto);

      const loginUserDto: LoginUserDto = {
        email: 'login-test@example.com',
        password: 'password123',
      };

      // Act
      const result = await authService.login(loginUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(loginUserDto.email);
      expect(result.token).toBe('test-token');
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Act & Assert
      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'wrong-password@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      // Create a user first
      await authService.register(createUserDto);

      const loginUserDto: LoginUserDto = {
        email: 'wrong-password@example.com',
        password: 'wrongpassword',
      };

      // Act & Assert
      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
