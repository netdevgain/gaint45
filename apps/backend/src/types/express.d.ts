import type { Role, User } from '@prisma/client';

interface JwtRequestUser {
  sub?: string;
  email?: string;
  role?: Role;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtRequestUser | User;
    }
  }
}

export {};
