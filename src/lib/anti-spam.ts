/**
 * @file Anti-spam 功能
 * @description 垃圾訊息防禦機制
 *   - Honeypot 欄位檢查
 *   - 速率限制檢查
 *   - 內容過濾（禁止詞、連結數量、長度）
 */

import { isRateLimited } from './rate-limiter';

/** Anti-spam 檢查結果 */
export interface AntiSpamResult {
  /** 是否通過檢查 */
  pass: boolean;
  /** 失敗原因（通過時為 undefined） */
  reason?:
    | 'honeypot'
    | 'rate_limit'
    | 'forbidden_word'
    | 'too_many_links'
    | 'content_too_short'
    | 'content_too_long';
}

/** 禁止詞清單（可配置） */
const FORBIDDEN_WORDS = ['spam', 'viagra'];

/** 最大連結數量 */
const MAX_LINKS = 3;

/** 最小內容長度 */
const MIN_CONTENT_LENGTH = 2;

/** 最大內容長度 */
const MAX_CONTENT_LENGTH = 5000;

/**
 * 檢查 Honeypot 欄位
 * @param honeypot Honeypot 欄位值
 * @returns 檢查結果
 */
export function checkHoneypot(
  honeypot: string | null | undefined
): AntiSpamResult {
  // 空白、null、undefined 都視為通過
  if (!honeypot || honeypot.trim() === '') {
    return { pass: true };
  }

  // 有任何內容就視為機器人
  return { pass: false, reason: 'honeypot' };
}

/**
 * 過濾內容
 * @param content 評論內容
 * @returns 檢查結果
 */
export function filterContent(content: string): AntiSpamResult {
  // 1. 檢查長度
  if (content.length < MIN_CONTENT_LENGTH) {
    return { pass: false, reason: 'content_too_short' };
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return { pass: false, reason: 'content_too_long' };
  }

  // 2. 檢查禁止詞（不區分大小寫）
  const lowerContent = content.toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (lowerContent.includes(word.toLowerCase())) {
      return { pass: false, reason: 'forbidden_word' };
    }
  }

  // 3. 檢查連結數量
  // 匹配 http:// 或 https:// 開頭的 URL
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const matches = content.match(urlRegex);
  const linkCount = matches ? matches.length : 0;

  if (linkCount > MAX_LINKS) {
    return { pass: false, reason: 'too_many_links' };
  }

  return { pass: true };
}

/**
 * Anti-spam 整合檢查
 * @param params 檢查參數
 * @returns 檢查結果
 */
export function checkAntiSpam(params: {
  content: string;
  honeypot: string | null | undefined;
  ipAddress: string;
}): AntiSpamResult {
  const { content, honeypot, ipAddress } = params;

  // 第一層：Honeypot 檢查
  const honeypotResult = checkHoneypot(honeypot);
  if (!honeypotResult.pass) {
    return honeypotResult;
  }

  // 第二層：Rate Limit 檢查
  if (isRateLimited(ipAddress)) {
    return { pass: false, reason: 'rate_limit' };
  }

  // 第三層：Content Filter 檢查
  const contentResult = filterContent(content);
  if (!contentResult.pass) {
    return contentResult;
  }

  return { pass: true };
}
