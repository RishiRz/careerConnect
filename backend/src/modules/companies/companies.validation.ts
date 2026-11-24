import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  website: z.string().url().max(300).optional(),
  industry: z.string().max(100).trim().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  location: z.string().max(100).trim().optional(),
}).strict();

export const updateCompanySchema = createCompanySchema.partial().strict();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
