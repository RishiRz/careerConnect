import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Building2, Users, ArrowRight, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-700/50 backdrop-blur-sm border border-primary-500/30 text-primary-200 text-xs font-semibold uppercase tracking-wider mb-8">
            <Zap className="h-4 w-4 text-yellow-400" /> CareerConnect 2.0 Released
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Discover Your Next Career Step.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">
              Connect with Top Hiring Teams.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Whether you are searching for your first internship or your next senior leadership role, CareerConnect empowers your recruitment journey.
          </p>

          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 bg-white p-2.5 rounded-2xl shadow-2xl">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, skills, or keywords..."
                className="w-full pl-11 pr-4 py-2.5 text-gray-900 rounded-lg focus:outline-none text-sm font-medium"
              />
            </div>
            <Link
              to="/jobs"
              className="btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
            >
              Browse Open Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-b border-gray-100 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Active Openings', value: '12,500+', icon: Briefcase },
              { label: 'Verified Companies', value: '750+', icon: Building2 },
              { label: 'Registered Candidates', value: '45,000+', icon: Users },
              { label: 'Security Score', value: '100% OWASP', icon: ShieldCheck },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm">
                <Icon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Split Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-8 border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">For Ambitious Job Seekers</h3>
              <p className="text-gray-600 text-sm mb-6">
                Build a rich career profile, upload your resume securely, and track your application status in real-time.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-700">
                {['Single-click applications with presigned storage', 'Comprehensive internship and entry-level filters', 'Automated notifications upon recruiter review'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/jobs" className="btn-primary inline-flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
              Find Opportunities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-8 bg-gray-900 text-white border-gray-900 flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">For Modern Recruiting Teams</h3>
              <p className="text-gray-300 text-sm mb-6">
                Post positions, filter applicants, evaluate candidate resumes, and coordinate the interview lifecycle seamlessly.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                {['Role-based verification and company identity security', 'Structured applicant review with status logs', 'Candidate shortlisting and schedule management'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 text-primary-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/register" className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2.5 px-4 rounded-lg inline-flex items-center justify-center gap-2 text-sm transition-colors w-full sm:w-auto">
              Register as Recruiter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
