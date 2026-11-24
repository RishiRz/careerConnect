import { z } from 'zod';

export const submitApplicationSchema = z.object({
  jobId: z.string().length(24, 'Invalid job ID'),
  resumeId: z.string().length(24, 'Invalid resume ID'),
  coverLetter: z.string().max(5000).trim().optional(),
}).strict();

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['under_review', 'shortlisted', 'interview_scheduled', 'offered', 'rejected']),
  note: z.string().max(1000).trim().optional(),
  interviewScheduledAt: z.string().datetime().optional(),
}).strict();

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
