import { MailModule } from '@/mail/mail.module';
import { User } from '@/modules/users/entities/user.entity';
import { UsersModule } from '@/modules/users/users.module';
import { envConfig } from '@/shared/config/env.config';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import { LocalStrategy } from './passport/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async () => ({
        global: true,
        secret: envConfig.JWT_SECRET,
        signOptions: { expiresIn: envConfig.JWT_EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule { }
