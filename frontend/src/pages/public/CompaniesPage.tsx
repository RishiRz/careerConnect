import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Globe, Users, ExternalLink, Search } from 'lucide-react';
import { api } from '../../lib/api';
import type { Company } from '../../types';

export function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (search) params.set('search', search);
      const res = await api.get(`/companies?${params}`);
      return res.data;
    },
  });

  const companies: Company[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Verified Companies Directory
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Explore approved corporate partners and innovative startups actively recruiting on CareerConnect.
        </p>
      </div>

      <div className="card shadow-sm border-gray-200 mb-8 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No verified companies found</h3>
          <p className="text-gray-500 text-sm mt-1">Try modifying your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="card hover:shadow-md transition-shadow p-6 border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl border border-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {company.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{company.name}</h3>
                    <p className="text-xs text-gray-500">{company.industry || 'Technology'}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-3 mb-4">
                  {company.description || 'Verified enterprise hiring through CareerConnect.'}
                </p>

                <div className="space-y-1.5 text-xs text-gray-500 mb-6">
                  {company.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" /> {company.location}
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-gray-400" /> {company.size} employees
                    </div>
                  )}
                </div>
              </div>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 w-full"
                >
                  Visit Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
