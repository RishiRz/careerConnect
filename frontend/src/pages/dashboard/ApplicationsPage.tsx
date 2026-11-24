import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Calendar, Trash2, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import type { Application } from '../../types';

export function ApplicationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/me');
      return res.data;
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/applications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  const applications: Application[] = data?.data || [];

  const statusColors: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    interview_scheduled: 'bg-indigo-100 text-indigo-700 font-bold',
    offered: 'bg-green-100 text-green-700 font-bold',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Application Tracker</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Review, track, and manage all your ongoing recruitment submissions.
        </p>
      </div>

      {isLoading ? (
        <div className="card animate-pulse py-8 text-center text-xs text-gray-400">
          Loading your applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-800">No applications found</h3>
          <p className="text-xs text-gray-500 mt-1">Start applying to openings to see them tracked here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = typeof app.jobId === 'object' ? app.jobId : null;
            const canWithdraw = !['offered', 'rejected', 'withdrawn'].includes(app.status);

            return (
              <div key={app._id} className="card p-6 shadow-sm border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className={`badge text-[11px] mb-2 ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900">{job?.title || 'Job Posting'}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {canWithdraw && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to withdraw this application?')) {
                          withdrawMutation.mutate(app._id);
                        }
                      }}
                      disabled={withdrawMutation.isPending}
                      className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 hover:bg-red-50 py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Withdraw
                    </button>
                  )}
                </div>

                {app.interviewScheduledAt && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-2 text-xs text-indigo-900">
                    <Calendar className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span>
                      <strong>Interview Scheduled:</strong> {new Date(app.interviewScheduledAt).toLocaleString()}
                    </span>
                  </div>
                )}

                {app.coverLetter && (
                  <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-700 mb-1">Cover Note:</p>
                    <p className="italic leading-relaxed">{app.coverLetter}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
