import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const refreshPayload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(refreshPayload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessPayload = { email: user.email, sub: user.id };
      const refreshPayload = { sub: user.id };

      return {
        access_token: this.jwtService.sign(accessPayload),
        refresh_token: this.jwtService.sign(refreshPayload, { expiresIn: '7d' }),
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
      };
    } catch (error) {
      console.error('Error during refreshToken:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}