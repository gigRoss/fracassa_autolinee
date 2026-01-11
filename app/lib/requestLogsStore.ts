import { getDb } from './db';
import { httpRequestLogs } from './schema';
import { desc, eq, gte, lte, and, like, sql, or } from 'drizzle-orm';

/**
 * Get request logs with filters
 */
export async function getRequestLogs(options?: {
  limit?: number;
  offset?: number;
  path?: string;
  method?: string;
  statusCode?: number;
  errorsOnly?: boolean;
  fromDate?: Date;
  toDate?: Date;
}) {
  const db = getDb();
  const { limit = 100, offset = 0, path, method, statusCode, errorsOnly, fromDate, toDate } = options || {};

  const conditions = [];
  if (path) conditions.push(like(httpRequestLogs.path, `%${path}%`));
  if (method) conditions.push(eq(httpRequestLogs.method, method.toUpperCase()));
  if (statusCode) conditions.push(eq(httpRequestLogs.statusCode, statusCode));
  if (errorsOnly) conditions.push(or(gte(httpRequestLogs.statusCode, 400), sql`${httpRequestLogs.errorMessage} IS NOT NULL`));
  if (fromDate) conditions.push(gte(httpRequestLogs.timestamp, fromDate));
  if (toDate) conditions.push(lte(httpRequestLogs.timestamp, toDate));

  const query = db.select().from(httpRequestLogs).orderBy(desc(httpRequestLogs.timestamp)).limit(limit).offset(offset);
  return conditions.length > 0 ? query.where(and(...conditions)) : query;
}

/**
 * Get only error logs
 */
export async function getErrorLogs(options?: { limit?: number; offset?: number; fromDate?: Date; toDate?: Date }) {
  return getRequestLogs({ ...options, errorsOnly: true });
}

/**
 * Get statistics
 */
export async function getRequestStats(options?: { fromDate?: Date; toDate?: Date }) {
  const db = getDb();
  const { fromDate, toDate } = options || {};

  const conditions = [];
  if (fromDate) conditions.push(gte(httpRequestLogs.timestamp, fromDate));
  if (toDate) conditions.push(lte(httpRequestLogs.timestamp, toDate));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [total, errors, avgTime, byPath, byStatus] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(httpRequestLogs).where(whereClause),
    db.select({ count: sql<number>`COUNT(*)` }).from(httpRequestLogs).where(whereClause ? and(whereClause, gte(httpRequestLogs.statusCode, 400)) : gte(httpRequestLogs.statusCode, 400)),
    db.select({ avg: sql<number>`AVG(${httpRequestLogs.durationMs})` }).from(httpRequestLogs).where(whereClause),
    db.select({ path: httpRequestLogs.path, count: sql<number>`COUNT(*)`, avgDuration: sql<number>`AVG(${httpRequestLogs.durationMs})` }).from(httpRequestLogs).where(whereClause).groupBy(httpRequestLogs.path).orderBy(sql`COUNT(*) DESC`).limit(10),
    db.select({ statusCode: httpRequestLogs.statusCode, statusText: httpRequestLogs.statusText, count: sql<number>`COUNT(*)` }).from(httpRequestLogs).where(whereClause).groupBy(httpRequestLogs.statusCode, httpRequestLogs.statusText).orderBy(sql`COUNT(*) DESC`),
  ]);

  return {
    totalRequests: total[0]?.count || 0,
    errorCount: errors[0]?.count || 0,
    errorRate: total[0]?.count ? ((errors[0]?.count || 0) / total[0].count * 100).toFixed(2) + '%' : '0%',
    avgResponseTime: Math.round(avgTime[0]?.avg || 0) + 'ms',
    topPaths: byPath,
    byStatusCode: byStatus,
  };
}

/**
 * Delete old logs
 */
export async function deleteOldLogs(olderThanDays: number = 30) {
  const db = getDb();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  return db.delete(httpRequestLogs).where(lte(httpRequestLogs.timestamp, cutoffDate));
}

