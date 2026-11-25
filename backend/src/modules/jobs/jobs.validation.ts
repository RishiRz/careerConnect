import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(50).max(20000).trim(),
  requirements: z.string().min(10).max(10000).trim(),
  responsibilities: z.string().max(10000).trim().optional(),
  location: z.string().min(2).max(100).trim(),
  isRemote: z.boolean().optional().default(false),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  salaryMin: z.number().min(0).max(10000000).optional(),
  salaryMax: z.number().min(0).max(10000000).optional(),
  salaryCurrency: z.string().max(10).optional().default('USD'),
  skills: z.array(z.string().max(50)).max(30).optional().default([]),
  applicationDeadline: z.string().datetime().optional(),
  isInternship: z.boolean().optional().default(false),
  internshipDurationMonths: z.number().int().min(1).max(24).optional(),
}).strict();

export const updateJobSchema = createJobSchema.partial().strict();

export const jobQuerySchema = z.object({
  
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default(1),

    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional().default(20),

  search: z.string().max(200).trim().optional(),
  location: z.string().max(100).trim().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  isInternship: z.string().transform((v) => v === 'true').optional(),
  companyId: z.string().max(24).optional(),
  sortBy: z.enum(['createdAt', 'applicationDeadline', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).strict();

export const updateJobStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'paused', 'closed']),
}).strict();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
