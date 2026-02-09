/**
 * @file 密碼雜湊工具函式
 * @description 提供密碼雜湊與驗證功能，使用 bcrypt 演算法。
 *   - hashPassword: 將明文密碼雜湊，使用 10+ rounds
 *   - verifyPassword: 比對明文密碼與雜湊值
 *   - 永不記錄明文密碼到日誌
 */

import bcrypt from 'bcrypt';

/** bcrypt cost factor，最低 10 rounds */
const SALT_ROUNDS = 10;

/**
 * 將明文密碼進行 bcrypt 雜湊
 * @param password 明文密碼
 * @returns 雜湊後的密碼字串
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 驗證明文密碼是否與雜湊值匹配
 * @param password 明文密碼
 * @param hash bcrypt 雜湊值
 * @returns 是否匹配
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
