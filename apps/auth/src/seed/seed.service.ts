import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@libs/common/schemas/user.schema';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async seedUsers(): Promise<void> {
    const count = await this.userModel.countDocuments();
    if (count > 0) {
      this.logger.log('Users collection is not empty, skipping seeding');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
      {
        email: 'user@example.com',
        password: hashedPassword,
        role: UserRole.USER,
      },
      {
        email: 'operator@example.com',
        password: hashedPassword,
        role: UserRole.OPERATOR,
      },
      {
        email: 'auditor@example.com',
        password: hashedPassword,
        role: UserRole.AUDITOR,
      },
    ];

    await this.userModel.insertMany(users);
    this.logger.log(`Seeded ${users.length} users`);
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Starting auth server seeding on application bootstrap...');
    await this.seedUsers();
    this.logger.log('Auth server seeding completed');
  }
}
