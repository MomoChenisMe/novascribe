/**
 * @file 版本 Service 層
 * @description 文章版本歷史完整邏輯
 *   - createVersion：建立版本（版本號自動遞增）
 *   - getVersions：取得版本列表（最新在前）
 *   - getVersionById：取得特定版本
 *   - compareVersions：比對兩個版本的差異
 *   - restoreVersion：回溯到指定版本（建立新版本）
 *   - cleanOldVersions：清理舊版本（保留最新 N 個）
 */

import { prisma } from '@/lib/prisma';
import type { Post, PostVersion } from '@/generated/prisma/client';

export interface VersionDiff {
  /** 變更摘要 */
  summary: string;
  /** 差異詳情 */
  details?: {
    titleChanged: boolean;
    contentChanges: {
      added: number;
      removed: number;
    };
  };
}

/**
 * 建立版本
 * - 通常由 post.service 自動呼叫
 * - 版本號自動遞增
 */
export async function createVersion(data: {
  postId: string;
  title: string;
  content: string;
}): Promise<PostVersion> {
  const latestVersion = await prisma.postVersion.findFirst({
    where: { postId: data.postId },
    orderBy: { version: 'desc' },
  });

  const nextVersion = (latestVersion?.version ?? 0) + 1;

  return prisma.postVersion.create({
    data: {
      postId: data.postId,
      title: data.title,
      content: data.content,
      version: nextVersion,
    },
  });
}

/**
 * 取得文章的版本列表（最新在前）
 */
export async function getVersions(postId: string): Promise<PostVersion[]> {
  return prisma.postVersion.findMany({
    where: { postId },
    orderBy: { version: 'desc' },
  });
}

/**
 * 取得特定版本
 */
export async function getVersionById(
  postId: string,
  versionId: string
): Promise<PostVersion | null> {
  return prisma.postVersion.findFirst({
    where: { id: versionId, postId },
  });
}

/**
 * 計算兩段文字的行級差異
 */
function computeLineDiff(from: string, to: string): { added: number; removed: number } {
  const fromLines = from.split('\n');
  const toLines = to.split('\n');

  // 使用簡單的 LCS 逼近：計算新增與刪除行數
  const fromSet = new Map<string, number>();
  for (const line of fromLines) {
    fromSet.set(line, (fromSet.get(line) ?? 0) + 1);
  }

  let matched = 0;
  const toSet = new Map<string, number>(fromSet);
  for (const line of toLines) {
    const count = toSet.get(line) ?? 0;
    if (count > 0) {
      toSet.set(line, count - 1);
      matched++;
    }
  }

  const removed = fromLines.length - matched;
  const added = toLines.length - matched;

  return { added, removed };
}

/**
 * 比對兩個版本的差異
 */
export async function compareVersions(
  postId: string,
  fromVersion: number,
  toVersion: number
): Promise<VersionDiff> {
  const from = await prisma.postVersion.findFirst({
    where: { postId, version: fromVersion },
  });

  if (!from) {
    throw new Error(`Version ${fromVersion} not found`);
  }

  const to = await prisma.postVersion.findFirst({
    where: { postId, version: toVersion },
  });

  if (!to) {
    throw new Error(`Version ${toVersion} not found`);
  }

  const titleChanged = from.title !== to.title;
  const contentChanges = computeLineDiff(from.content, to.content);

  const changes: string[] = [];
  if (titleChanged) {
    changes.push('標題已變更');
  }
  if (contentChanges.added > 0 || contentChanges.removed > 0) {
    changes.push(
      `內容變更：+${contentChanges.added} 行 / -${contentChanges.removed} 行`
    );
  }

  const summary = changes.length > 0 ? changes.join('；') : '無變更';

  return {
    summary,
    details: {
      titleChanged,
      contentChanges,
    },
  };
}

/**
 * 回溯到指定版本
 * - 更新 Post 的 title 和 content
 * - 自動建立新版本（回溯也算一次更新）
 */
export async function restoreVersion(
  postId: string,
  versionId: string
): Promise<Post> {
  return prisma.$transaction(async (tx) => {
    // 取得目標版本
    const targetVersion = await tx.postVersion.findFirst({
      where: { id: versionId, postId },
    });

    if (!targetVersion) {
      throw new Error('Version not found');
    }

    // 取得目前最新版本號
    const latestVersion = await tx.postVersion.findFirst({
      where: { postId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    // 建立新版本（回溯記錄）
    await tx.postVersion.create({
      data: {
        postId,
        title: targetVersion.title,
        content: targetVersion.content,
        version: nextVersion,
      },
    });

    // 更新文章
    const updatedPost = await tx.post.update({
      where: { id: postId },
      data: {
        title: targetVersion.title,
        content: targetVersion.content,
      },
    });

    return updatedPost;
  });
}

/**
 * 清理舊版本（保留最新 N 個版本）
 * @param postId 文章 ID
 * @param keepCount 保留數量（預設 10）
 * @returns 刪除數量
 */
export async function cleanOldVersions(
  postId: string,
  keepCount: number = 10
): Promise<number> {
  const versions = await prisma.postVersion.findMany({
    where: { postId },
    orderBy: { version: 'desc' },
  });

  if (versions.length <= keepCount) {
    return 0;
  }

  const versionsToDelete = versions.slice(keepCount);
  const idsToDelete = versionsToDelete.map((v) => v.id);

  const result = await prisma.postVersion.deleteMany({
    where: { id: { in: idsToDelete } },
  });

  return result.count;
}
