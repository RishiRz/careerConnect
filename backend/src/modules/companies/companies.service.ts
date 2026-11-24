import mongoose from 'mongoose';
import Company, { ICompany } from './company.model';
import RecruiterProfile from '../profiles/recruiter-profile.model';
import AuditLog from '../audit/audit.model';
import { AppError } from '../../middleware/errorHandler';
import { buildPaginationMeta } from '../../utils/response';
import type { CreateCompanyInput, UpdateCompanyInput } from './companies.validation';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 220);
}

export async function createCompany(input: CreateCompanyInput, userId: string): Promise<ICompany> {
  const slug = slugify(input.name);

  const existing = await Company.findOne({ slug }).lean().exec();
  if (existing) {
    throw new AppError('A company with this name already exists.', 409);
  }

  const company = await Company.create({
    ...input,
    slug,
    createdBy: new mongoose.Types.ObjectId(userId),
    status: 'pending',
  });

  await RecruiterProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $set: { companyId: company._id } },
    { runValidators: true }
  );

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(userId),
    action: 'company.created',
    targetId: company._id,
    targetType: 'Company',
    metadata: { name: company.name },
  });

  return company;
}

export async function getCompanies(page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { status: 'verified' };

  if (search && search.length > 0 && search.length <= 200) {
    filter.$text = { $search: search };
  }

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .select('name slug description industry size location logoKey')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Company.countDocuments(filter),
  ]);

  return { companies, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getCompanyById(companyId: string) {
  if (!mongoose.isValidObjectId(companyId)) throw new AppError('Invalid company ID.', 400);

  const company = await Company.findOne({ _id: companyId, status: 'verified' })
    .select('-createdBy -verifiedBy -rejectionReason')
    .lean()
    .exec();

  if (!company) throw new AppError('Company not found.', 404);
  return company;
}

export async function updateCompany(companyId: string, userId: string, role: string, input: UpdateCompanyInput): Promise<ICompany> {
  if (!mongoose.isValidObjectId(companyId)) throw new AppError('Invalid company ID.', 400);

  const filter =
    role === 'admin'
      ? { _id: new mongoose.Types.ObjectId(companyId) }
      : { _id: new mongoose.Types.ObjectId(companyId), createdBy: new mongoose.Types.ObjectId(userId) };

  const updated = await Company.findOneAndUpdate(
    filter,
    { $set: input },
    { new: true, runValidators: true }
  ).exec();

  if (!updated) throw new AppError('Company not found or access denied.', 404);
  return updated;
}
