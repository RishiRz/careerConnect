import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Clock, Building2, Briefcase, DollarSign, Filter, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import type { Job, Company } from '../../types';

export function JobsPage({ defaultInternship = false }: { defaultInternship?: boolean }) {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [isInternship, setIsInternship] = useState<boolean>(defaultInternship);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', { search, jobType, location, isInternship, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (jobType) params.set('jobType', jobType);
      if (location) params.set('location', location);
      if (isInternship) params.set('isInternship', 'true');
      const res = await api.get(`/jobs?${params}`);
      return res.data;
    },
  });

  const jobs: Job[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {isInternship ? 'Internship Opportunities' : 'Explore Open Positions'}
            <span className="badge bg-primary-100 text-primary-700 text-xs font-semibold py-1">
              {pagination?.total ?? 0} Listings
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse verified openings from top companies and startups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsInternship(false); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isInternship ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Jobs
          </button>
          <button
            onClick={() => { setIsInternship(true); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isInternship ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Internships Only
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card shadow-sm border-gray-200 mb-8 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by title, keywords..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Location or 'Remote'..."
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>
          <div>
            <select
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="">All Employment Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job listings */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No postings matched your criteria</h3>
          <p className="text-gray-500 text-sm mt-1">Try resetting filters or expanding your search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const company = typeof job.companyId === 'object' ? (job.companyId as Company) : null;
            return (
              <div
                key={job._id}
                className="card hover:shadow-md transition-shadow p-6 border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {company?.name || 'Enterprise'}
                    </span>
                    {job.isInternship && (
                      <span className="badge bg-green-100 text-green-700">Internship</span>
                    )}
                    {job.isRemote && (
                      <span className="badge bg-purple-100 text-purple-700">Remote</span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                    <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                  </h2>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.jobType}</span>
                    {job.salaryMin && (
                      <span className="flex items-center gap-1 text-gray-700 font-medium">
                        <DollarSign className="h-3.5 w-3.5" /> ${job.salaryMin.toLocaleString()}
                        {job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : '+'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/jobs/${job._id}`} className="btn-primary text-xs py-2 px-4 whitespace-nowrap">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600 px-2 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
