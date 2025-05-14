import { UserRole } from '@/shared/constants/common.constant'

export type TokenPayloadType = {
  id: string
  role: UserRole
  session: string
  iat: Date
  exp: Date
}

export type AuthenticatedRequestType = Request & {
  user: TokenPayloadType
}
