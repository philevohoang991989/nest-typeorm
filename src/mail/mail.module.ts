import { envConfig } from '@/shared/config/env.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        // transport: {
        //   host: config.get('MAIL_HOST'),
        //   port: config.get('MAIL_PORT'),
        //   secure: false,
        //   auth: {
        //     user: config.get('MAIL_USER'),
        //     pass: config.get('MAIL_PASSWORD'),
        //   },
        // },
        // defaults: {
        //   from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        // },
        // template: {
        //   dir: join(__dirname, 'templates'),
        //   adapter: new HandlebarsAdapter(),
        //   options: {
        //     strict: true,
        //   },
        // },
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          // ignoreTLS: true,
          // secure: true,
          auth: {
            user: envConfig.MAIL_USER,
            pass: envConfig.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: 'philevohoang@gmail.com',
        },
        preview: false,
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule { }
