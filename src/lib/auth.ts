/**
 * @file NextAuth.js 設定
 * @description NextAuth.js v4 認證設定，使用 Credentials Provider + JWT session 策略。
 *   - Credentials Provider: email/密碼登入
 *   - JWT session: 24 小時過期
 *   - 自訂 callbacks: token 包含 userId/email
 *   - Rate limiting: 基於 IP 的速率限制
 */

import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import {
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
} from '@/lib/rate-limiter';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req): Promise<User | null> {
        // 取得客戶端 IP
        const ip =
          (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          (req?.headers?.['x-real-ip'] as string) ||
          'unknown';

        // 1. 檢查 rate limit
        if (isRateLimited(ip)) {
          throw new Error('RATE_LIMITED');
        }

        // 2. 驗證輸入
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 3. 查詢 user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          recordFailedAttempt(ip);
          return null;
        }

        // 4. 比對密碼 (bcrypt)
        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          recordFailedAttempt(ip);
          return null;
        }

        // 5. 成功→清除失敗記錄，回傳 user
        clearAttempts(ip);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 小時
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.userId as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
