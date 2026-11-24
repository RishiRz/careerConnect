import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, UploadCloud, Trash2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Resume } from '../../types';

export function ResumePage() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: async () => {
      const res = await api.get('/resumes/me');
      return res.data;
    },
  });

  const resumes: Resume[] = data?.data || [];

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      setUploadSuccess('Resume uploaded successfully.');
      setUploadError('');
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || 'Upload failed.');
      setUploadSuccess('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/resumes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
    },
  });

  const handleDownload = async (resumeId: string) => {
    try {
      const res = await api.get(`/resumes/${resumeId}/download`);
      if (res.data?.data?.downloadUrl) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Download request failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Secure Resume Vault</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Upload and manage your CVs. All files are signature-validated and encrypted in private cloud storage.
        </p>
      </div>

      {uploadSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="card shadow-sm border-gray-200 p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Upload New Resume</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
          <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700">Choose a PDF or DOCX file (up to 5 MB)</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Magic byte integrity check is enforced.</p>

          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
            }}
            className="mt-4 text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
          />
        </div>

        {selectedFile && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <FileText className="h-4 w-4 text-primary-600" />
              <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={() => uploadMutation.mutate(selectedFile)}
              disabled={uploadMutation.isPending}
              className="btn-primary text-xs py-1.5 px-4"
            >
              {uploadMutation.isPending ? 'Verifying...' : 'Upload Now'}
            </button>
          </div>
        )}
      </div>

      {/* Existing Resumes */}
      <div className="card shadow-sm border-gray-200 p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Your Uploaded Documents</h2>

        {isLoading ? (
          <p className="text-xs text-gray-500">Loading files...</p>
        ) : resumes.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No resumes uploaded yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {resumes.map((resume) => (
              <div key={resume._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-gray-900">{resume.originalName}</h3>
                    <p className="text-[11px] text-gray-400">
                      Uploaded {new Date(resume.uploadedAt).toLocaleDateString()} • {(resume.sizeBytes / 1024).toFixed(0)} KB • Status: <span className="text-green-600 font-medium">{resume.status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(resume._id)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Download presigned"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this resume?')) {
                        deleteMutation.mutate(resume._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
