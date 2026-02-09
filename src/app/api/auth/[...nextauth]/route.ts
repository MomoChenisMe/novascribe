/**
 * @file NextAuth.js Route Handler
 * @description 處理所有 /api/auth/* 路由的認證請求。
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
