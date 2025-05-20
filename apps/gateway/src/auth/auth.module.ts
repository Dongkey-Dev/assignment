import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConfig } from '@libs/common/config/jwt.config';

@Module({
  imports: [HttpModule, JwtModule.registerAsync(jwtConfig)],
  controllers: [AuthController],
})
export class AuthModule {}
