import { config } from 'dotenv'

import { EnvConfigDTO } from './dto/env.dto'

config()

export const envConfig = new EnvConfigDTO()

envConfig.JWT_SECRET = process.env.JWT_SECRET ?? ''
envConfig.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? ''
envConfig.MAIL_USER = process.env.MAIL_USER ?? ""
envConfig.MAIL_PASSWORD = process.env.MAIL_PASSWORD ?? ""