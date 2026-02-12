/**
 * @file Next.js Middleware 路由保護
 * @description 使用 NextAuth.js middleware 保護 /admin 路由。
 *   - 未認證使用者重新導向至 /login
 *   - 已認證使用者放行
 *   - matcher: /admin/:path*
 */

import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};
