import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Briefcase, GraduationCap, MapPin, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await api.get('/profiles/me');
      const p = res.data?.data;
      if (p) {
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setSkills((p.skills || []).join(', '));
        setLinkedinUrl(p.linkedinUrl || '');
        setGithubUrl(p.githubUrl || '');
      }
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
      };
      const res = await api.patch('/profiles/me', payload);
      return res.data;
    },
    onSuccess: () => {
      setStatusMessage('Profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (err: any) => {
      setStatusMessage(err.response?.data?.message || 'Update failed.');
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Candidate Profile</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Keep your headline, background, and technical skillset up-to-date for recruiters.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="card shadow-sm border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Senior Full-Stack Engineer | React & Node.js Specialist"
            className="input-field text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Biography / Summary</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Summarize your professional experience, achievements, and career focus..."
            className="input-field text-xs resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, MongoDB"
              className="input-field text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn Profile</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">GitHub / Portfolio URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="input-field text-xs"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="btn-primary text-xs py-2.5 px-6 shadow-sm disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
