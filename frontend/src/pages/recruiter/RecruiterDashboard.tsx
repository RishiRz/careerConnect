import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Building2, Users, PlusCircle, CheckCircle2, Clock, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import type { Job, Company, Application } from '../../types';

export function RecruiterDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'jobs' | 'new-job' | 'company'>('jobs');

  // Job creation form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [skills, setSkills] = useState('');
  const [isInternship, setIsInternship] = useState(false);
  const [jobSuccess, setJobSuccess] = useState('');
  const [jobError, setJobError] = useState('');

  // Company creation form states
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companySuccess, setCompanySuccess] = useState('');
  const [companyError, setCompanyError] = useState('');

  // Fetch recruiter jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs/me/list');
      return res.data;
    },
  });

  const jobs: Job[] = jobsData?.data || [];

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/jobs', {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        location: location.trim(),
        jobType,
        experienceLevel,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        isInternship,
      });
      return res.data;
    },
    onSuccess: () => {
      setJobSuccess('Job posted successfully! It is now active.');
      setJobError('');
      setTitle('');
      setDescription('');
      setRequirements('');
      setLocation('');
      setSkills('');
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      setActiveTab('jobs');
    },
    onError: (err: any) => {
      setJobError(err.response?.data?.message || 'Failed to create job posting.');
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/companies', {
        name: companyName.trim(),
        description: companyDesc.trim() || undefined,
        website: companyWebsite.trim() || undefined,
        industry: companyIndustry.trim() || undefined,
        location: companyLocation.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setCompanySuccess('Company created! Awaiting admin verification.');
      setCompanyError('');
    },
    onError: (err: any) => {
      setCompanyError(err.response?.data?.message || 'Failed to create company profile.');
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recruiter Operations Hub</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Manage your company profile, post vacancies, and review applicant funnels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'jobs' ? 'bg-primary-600 text-white' : 'btn-secondary'
            }`}
          >
            My Job Postings ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('new-job')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'new-job' ? 'bg-primary-600 text-white' : 'btn-secondary'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" /> Post Job
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'company' ? 'bg-primary-600 text-white' : 'btn-secondary'
            }`}
          >
            Company Profile
          </button>
        </div>
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobsLoading ? (
            <p className="text-xs text-gray-400">Loading your postings...</p>
          ) : jobs.length === 0 ? (
            <div className="card text-center py-16 border-dashed border-2">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-800">No active job postings</h3>
              <p className="text-xs text-gray-500 mt-1">Publish a job or internship to start receiving applications.</p>
              <button onClick={() => setActiveTab('new-job')} className="btn-primary text-xs py-2 px-4 mt-4">
                Create First Opening
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div key={job._id} className="card p-5 border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge bg-green-100 text-green-700 capitalize text-[10px]">{job.status}</span>
                      {job.isInternship && <span className="badge bg-blue-100 text-blue-700 text-[10px]">Internship</span>}
                    </div>
                    <h3 className="font-bold text-base text-gray-900">{job.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.location} • {job.jobType} • Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-xl font-bold text-gray-900">{job.applicationCount || 0}</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Applicants</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-bold text-gray-900">{job.viewCount || 0}</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'new-job' && (
        <div className="card p-6 shadow-sm border-gray-200 max-w-3xl space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Create New Opening</h2>

          {jobError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{jobError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Position Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="input-field text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Type</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input-field text-xs">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Experience Level</label>
              <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input-field text-xs">
                <option value="entry">Entry level</option>
                <option value="mid">Mid level</option>
                <option value="senior">Senior level</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, NY or Remote"
              className="input-field text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Min Salary ($)</label>
              <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="80000" className="input-field text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Max Salary ($)</label>
              <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="120000" className="input-field text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Job Description * (min 50 chars)</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide an overview of the role, day-to-day impact, and mission..."
              className="input-field text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Requirements * (min 10 chars)</label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Technical skills, years of experience, educational requirements..."
              className="input-field text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Node.js, Express, React, TypeScript"
              className="input-field text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isInternship"
              checked={isInternship}
              onChange={(e) => setIsInternship(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isInternship" className="text-xs font-medium text-gray-700">
              This is a student or entry-level internship program
            </label>
          </div>

          <button
            onClick={() => createJobMutation.mutate()}
            disabled={createJobMutation.isPending || !title || !description || !requirements || !location}
            className="btn-primary text-xs py-2.5 px-6 disabled:opacity-50"
          >
            {createJobMutation.isPending ? 'Publishing...' : 'Publish Job Listing'}
          </button>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="card p-6 shadow-sm border-gray-200 max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Register Company Profile</h2>
          <p className="text-xs text-gray-500">
            Before posting public vacancies, your company profile must be submitted and approved by an administrator.
          </p>

          {companySuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{companySuccess}</span>
            </div>
          )}

          {companyError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{companyError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Company Legal Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Technologies Inc."
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://example.com"
              className="input-field text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={companyIndustry}
                onChange={(e) => setCompanyIndustry(e.target.value)}
                placeholder="Software, Fintech, Healthcare"
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Headquarters Location</label>
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">About Company</label>
            <textarea
              rows={3}
              value={companyDesc}
              onChange={(e) => setCompanyDesc(e.target.value)}
              placeholder="Tell prospective candidates about your company mission and culture..."
              className="input-field text-xs resize-none"
            />
          </div>

          <button
            onClick={() => createCompanyMutation.mutate()}
            disabled={createCompanyMutation.isPending || !companyName}
            className="btn-primary text-xs py-2.5 px-6 disabled:opacity-50"
          >
            {createCompanyMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      )}
    </div>
  );
}
