import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { ClipboardList, FileText, Bell, ArrowRight, CheckCircle2, Clock, Calendar } from 'lucide-react';
import type { Application, Notification, Resume } from '../../types';

export function DashboardOverview() {
  const { user } = useAuth();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/me?limit=5');
      return res.data;
    },
  });

  const { data: resumesData } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: async () => {
      const res = await api.get('/resumes/me');
      return res.data;
    },
  });

  const { data: notifsData } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=5');
      return res.data;
    },
  });

  const applications: Application[] = appsData?.data || [];
  const resumes: Resume[] = resumesData?.data || [];
  const notifications: Notification[] = notifsData?.data || [];

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Here is a quick snapshot of your recruitment activity and profile status.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/dashboard/applications" className="card p-5 hover:shadow-md transition-shadow flex items-center justify-between border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Applications</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{appsData?.pagination?.total ?? applications.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
        </Link>

        <Link to="/dashboard/resume" className="card p-5 hover:shadow-md transition-shadow flex items-center justify-between border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium">Uploaded Resumes</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{resumes.length}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
        </Link>

        <div className="card p-5 flex items-center justify-between border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium">Unread Notifications</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">
              {notifications.filter(n => !n.isRead).length}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Bell className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="card shadow-sm border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
          <Link to="/dashboard/applications" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {appsLoading ? (
          <p className="text-xs text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-10 border-dashed border-2 rounded-lg">
            <ClipboardList className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">You haven't submitted any applications yet.</p>
            <Link to="/jobs" className="text-primary-600 text-xs font-semibold hover:underline mt-1 inline-block">
              Explore Available Openings
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {applications.map((app) => {
              const jobTitle = typeof app.jobId === 'object' ? app.jobId?.title : 'Position';
              const companyName = typeof app.jobId === 'object' && app.jobId?.companyId?.name ? app.jobId.companyId.name : 'Company';
              return (
                <div key={app._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-xs text-gray-900">{jobTitle}</h3>
                    <p className="text-[11px] text-gray-500">{companyName} • Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge text-[11px] px-2.5 py-1 ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notifications preview */}
      {notifications.length > 0 && (
        <div className="card shadow-sm border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Latest System Updates</h2>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif._id} className="p-3 bg-gray-50 rounded-lg text-xs border border-gray-100">
                <p className="font-semibold text-gray-900">{notif.title}</p>
                <p className="text-gray-600 mt-0.5">{notif.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
