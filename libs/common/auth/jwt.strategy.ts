import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET || 'DEV_TEMP_SECRET',
    });
  }

  async validate(payload: any) {
    if (payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Token expired');
    }
    return payload;
  }
}
