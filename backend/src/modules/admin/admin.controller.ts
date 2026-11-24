import { Request, Response, NextFunction } from 'express';
import {
  adminGetUsers,
  adminChangeUserStatus,
  adminGetPendingCompanies,
  adminVerifyCompany,
  adminModerateJob,
  adminGetAuditLogs,
  adminGetPlatformStats,
} from './admin.service';
import { successResponse } from '../../utils/response';

export async function getUsersHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const result = await adminGetUsers(page, limit, search);
    successResponse(res, result.users, 'Users retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}

export async function changeUserStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const user = await adminChangeUserStatus(req.params.id, status, req.session.userId!);
    successResponse(res, user, 'User status updated.');
  } catch (err) { next(err); }
}

export async function getPendingCompaniesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await adminGetPendingCompanies(page);
    successResponse(res, result.companies, 'Pending companies retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}

export async function verifyCompanyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { approve, rejectionReason } = req.body;
    const company = await adminVerifyCompany(req.params.id, req.session.userId!, approve === true, rejectionReason);
    successResponse(res, company, approve ? 'Company verified.' : 'Company rejected.');
  } catch (err) { next(err); }
}

export async function moderateJobHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { approve, rejectionReason } = req.body;
    const job = await adminModerateJob(req.params.id, req.session.userId!, approve === true, rejectionReason);
    successResponse(res, job, 'Job moderated.');
  } catch (err) { next(err); }
}

export async function getAuditLogsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const action = typeof req.query.action === 'string' ? req.query.action : undefined;
    const result = await adminGetAuditLogs(page, limit, action);
    successResponse(res, result.logs, 'Audit logs retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}

export async function getStatsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminGetPlatformStats();
    successResponse(res, stats, 'Platform stats retrieved.');
  } catch (err) { next(err); }
}
