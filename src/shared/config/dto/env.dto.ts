import { IsInt, IsNotEmpty, IsString } from 'class-validator'

export class EnvConfigDTO {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string

  @IsInt()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string

  @IsString()
  @IsNotEmpty()
  MAIL_USER: string

  @IsString()
  @IsNotEmpty()
  MAIL_PASSWORD: string
}
