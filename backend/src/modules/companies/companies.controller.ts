import { Request, Response, NextFunction } from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from './companies.service';
import { successResponse } from '../../utils/response';
import type { CreateCompanyInput, UpdateCompanyInput } from './companies.validation';

export async function createCompanyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await createCompany(req.body as CreateCompanyInput, req.session.userId!);
    successResponse(res, company, 'Company profile created. Awaiting admin verification.', 201);
  } catch (err) { next(err); }
}

export async function listCompaniesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const result = await getCompanies(page, limit, search);
    successResponse(res, result.companies, 'Companies retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}

export async function getCompanyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyById(req.params.id);
    successResponse(res, company, 'Company details retrieved.');
  } catch (err) { next(err); }
}

export async function updateCompanyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await updateCompany(req.params.id, req.session.userId!, req.session.role!, req.body as UpdateCompanyInput);
    successResponse(res, company, 'Company updated.');
  } catch (err) { next(err); }
}
