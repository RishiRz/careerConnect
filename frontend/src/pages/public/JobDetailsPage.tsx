import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, MapPin, Clock, DollarSign, Calendar, CheckCircle2, ArrowLeft, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Job, Company, Resume } from '../../types';

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Fetch job details
  const { data: jobData, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await api.get(`/jobs/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch applicant resumes if logged in as jobseeker
  const { data: resumesData } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: async () => {
      const res = await api.get('/resumes/me');
      return res.data;
    },
    enabled: isAuthenticated && user?.role === 'jobseeker',
  });

  const resumes: Resume[] = resumesData?.data || [];
  const job: Job = jobData?.data;
  const company = typeof job?.companyId === 'object' ? (job.companyId as Company) : null;

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/applications', {
        jobId: id,
        resumeId: selectedResumeId || resumes[0]?._id,
        coverLetter: coverLetter.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setApplySuccess(true);
      setApplyError('');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (err: any) => {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    },
  });

  if (jobLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading opening details...</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-semibold mb-4">Job listing not found or has been closed.</p>
        <Link to="/jobs" className="btn-secondary text-sm inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Job Results
      </Link>

      <div className="card shadow-sm border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-primary-100 text-primary-700 font-semibold">
                {company?.name || 'Verified Company'}
              </span>
              {job.isInternship && (
                <span className="badge bg-green-100 text-green-700">Internship</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" /> {job.location}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-gray-400" /> {job.jobType}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-400" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {job.salaryMin && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left md:text-right">
              <p className="text-xs text-gray-500 font-medium">Estimated Compensation</p>
              <p className="text-xl font-bold text-gray-900">
                ${job.salaryMin.toLocaleString()}{job.salaryMax ? ` – $${job.salaryMax.toLocaleString()}` : '+'}
              </p>
              <p className="text-[11px] text-gray-400">per annum / contract</p>
            </div>
          )}
        </div>

        {/* Content sections */}
        <div className="py-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Role Overview</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Requirements & Qualifications</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </div>
          </div>

          {job.responsibilities && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">Key Responsibilities</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">Desired Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="badge bg-gray-100 text-gray-700 border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Application Box */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          {!isAuthenticated ? (
            <div className="bg-primary-50 rounded-xl p-6 text-center border border-primary-100">
              <h3 className="text-base font-bold text-primary-900 mb-1">Interested in this role?</h3>
              <p className="text-xs text-primary-700 mb-4">
                Sign in with your CareerConnect account to submit your resume with one click.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/login" className="btn-primary text-xs py-2 px-5">
                  Sign In to Apply
                </Link>
                <Link to="/register" className="btn-secondary text-xs py-2 px-5">
                  Create Account
                </Link>
              </div>
            </div>
          ) : user?.role !== 'jobseeker' ? (
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
              <p className="text-xs font-semibold text-yellow-800">
                You are currently signed in as a <span className="capitalize">{user?.role}</span>. Only Job Seekers can apply.
              </p>
            </div>
          ) : applySuccess ? (
            <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-green-900">Application Submitted!</h3>
              <p className="text-xs text-green-700 mt-1 mb-4">
                The hiring team has received your profile. You can monitor the status on your applications dashboard.
              </p>
              <Link to="/dashboard/applications" className="btn-primary text-xs py-2 px-4 inline-block">
                Track Application
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900">Submit Your Application</h3>
              {applyError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Resume</label>
                {resumes.length === 0 ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 flex justify-between items-center">
                    <span>No uploaded resumes found.</span>
                    <Link to="/dashboard/resume" className="text-primary-600 font-semibold hover:underline">
                      Upload Resume First
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="input-field text-xs"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.originalName} ({new Date(r.uploadedAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cover Note / Pitch (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit for this position..."
                  className="input-field text-xs resize-none"
                />
              </div>

              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending || resumes.length === 0}
                className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {applyMutation.isPending ? 'Submitting...' : 'Send Application'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
