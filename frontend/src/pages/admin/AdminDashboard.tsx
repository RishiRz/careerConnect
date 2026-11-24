import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Building2, Users, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending-companies' | 'users' | 'audit'>('pending-companies');

  // Stats query
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    },
  });

  // Pending companies query
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['admin-pending-companies'],
    queryFn: async () => {
      const res = await api.get('/admin/companies/pending');
      return res.data;
    },
  });

  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    },
    enabled: activeTab === 'users',
  });

  // Audit logs query
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs');
      return res.data;
    },
    enabled: activeTab === 'audit',
  });

  const verifyCompanyMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const res = await api.patch(`/admin/companies/${id}/verify`, { approve });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-companies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const changeUserStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'suspended' }) => {
      const res = await api.patch(`/admin/users/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const stats = statsData?.data || {
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingCompanies: 0,
  };

  const pendingCompanies = companiesData?.data || [];
  const users = usersData?.data || [];
  const auditLogs = auditData?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4" /> Administration Portal
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security & Governance Console</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Platform-wide controls, employer verification workflows, and security audit monitoring.
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Published Jobs', value: stats.totalJobs, icon: FileText, color: 'text-green-600 bg-green-50' },
          { label: 'Applications', value: stats.totalApplications, icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' },
          { label: 'Pending Companies', value: stats.pendingCompanies, icon: Building2, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('pending-companies')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'pending-companies'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Company Verifications ({pendingCompanies.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          User Accounts
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {activeTab === 'pending-companies' && (
        <div className="space-y-4">
          {companiesLoading ? (
            <p className="text-xs text-gray-400">Loading pending employers...</p>
          ) : pendingCompanies.length === 0 ? (
            <div className="card text-center py-12 border-dashed border-2">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-800">No pending company verifications</p>
              <p className="text-[11px] text-gray-500 mt-0.5">All recruiter companies have been verified.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingCompanies.map((c: any) => (
                <div key={c._id} className="card p-5 border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{c.name}</h3>
                    <p className="text-xs text-gray-500">
                      {c.industry || 'General Industry'} • {c.location || 'Location Not Specified'}
                    </p>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline mt-1 block">
                        {c.website}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => verifyCompanyMutation.mutate({ id: c._id, approve: true })}
                      disabled={verifyCompanyMutation.isPending}
                      className="btn-primary text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => verifyCompanyMutation.mutate({ id: c._id, approve: false })}
                      disabled={verifyCompanyMutation.isPending}
                      className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 flex items-center gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card shadow-sm border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u: any) => (
                  <tr key={u._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{u.firstName} {u.lastName}</div>
                      <div className="text-gray-500 text-[11px]">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge bg-gray-100 text-gray-800 uppercase text-[10px]">{u.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge text-[10px] ${u.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => changeUserStatusMutation.mutate({
                            id: u._id,
                            status: u.accountStatus === 'active' ? 'suspended' : 'active',
                          })}
                          disabled={changeUserStatusMutation.isPending}
                          className="text-[11px] font-semibold text-purple-600 hover:text-purple-800"
                        >
                          {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card shadow-sm border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log: any) => (
                  <tr key={log._id}>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{log.actorEmail || 'System'}</td>
                    <td className="px-6 py-3 whitespace-nowrap font-mono text-purple-700">{log.action}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-500">{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
