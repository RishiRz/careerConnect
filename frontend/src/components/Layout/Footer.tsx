import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Shield, Lock, FileCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-gray-900">CareerConnect</span>
            </div>
            <p className="text-sm text-gray-500">
              Connecting passionate talent with forward-thinking teams. Built with enterprise security and OWASP compliance.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3">For Candidates</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/jobs" className="hover:text-primary-600">Browse Jobs</Link></li>
              <li><Link to="/internships" className="hover:text-primary-600">Internship Programs</Link></li>
              <li><Link to="/companies" className="hover:text-primary-600">Explore Companies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3">For Employers</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/register" className="hover:text-primary-600">Post Vacancies</Link></li>
              <li><Link to="/recruiter" className="hover:text-primary-600">Recruitment Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-primary-600">Company Verification</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3">Security & Trust</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-600" /> OWASP Top 10:2025 Enforced
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-blue-600" /> Argon2id Password Hashing
              </li>
              <li className="flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-purple-600" /> Secure S3 Encrypted Resumes
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CareerConnect Portal. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-gray-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-900 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-900 cursor-pointer">Security Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
