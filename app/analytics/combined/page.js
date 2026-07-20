'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/Tooltip';

export default function CombinedAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'score-desc',
    skillFilter: null,
    statusFilter: 'all',
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      // Fixed 2026-07-20: this page has always called /api/analytics/combined,
      // which returns 404 -- the real, working implementation lives at
      // /api/combined-analytics (no nested /analytics/ segment). This page
      // has likely never successfully loaded any data since it was built.
      const res = await fetch(`/api/combined-analytics?${params}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportFullReport = async () => {
    // NOTE (2026-07-20): /api/analytics/combined/export doesn't exist yet
    // (404) -- this button has never worked. Not fixed here since it's a
    // real feature to build (Excel export), not a path typo like the main
    // data fetch was. Flagged, not silently left.
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/analytics/combined/export?${params}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `combined-analytics-${Date.now()}.xlsx`;
      a.click();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateReport = async () => {
    // NOTE (2026-07-20): /api/analytics/combined/report doesn't exist yet
    // (404) -- same situation as export above, a real feature to build,
    // not fixed here.
    try {
      const res = await fetch('/api/analytics/combined/report', {
        method: 'POST',
      });
      const data = await res.json();
      router.push(`/reports/${data.reportId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Combined Analytics
          </h1>
          <div className="flex gap-3">
            <Tooltip content="Go back to admin dashboard">
              <button
                onClick={() => router.push('/admin')}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
              >
                ← Back
              </button>
            </Tooltip>

            <Tooltip content="Download all data as Excel spreadsheet">
              <button
                onClick={handleExportFullReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Export Data
              </button>
            </Tooltip>

            <Tooltip content="Create a comprehensive analysis report">
              <button
                onClick={handleGenerateReport}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                Generate Report
              </button>
            </Tooltip>

            <Tooltip content="Refresh all analytics data">
              <button
                onClick={() => setFilters({ ...filters })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Refresh
              </button>
            </Tooltip>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="recent">Most Recent</option>
                <option value="name">Student Name</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skill
              </label>
              <select
                value={filters.skillFilter || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    skillFilter: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Skills</option>
                {analytics?.skills?.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) =>
                  setFilters({ ...filters, statusFilter: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="passing">Passing Only</option>
                <option value="failing">Failing Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm mb-2">Total Students</p>
            <p className="text-3xl font-bold text-slate-900">
              {analytics?.total_students}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm mb-2">Class Average</p>
            <p className="text-3xl font-bold text-blue-600">
              {analytics?.class_average?.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm mb-2">Passing Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.passing_rate?.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Student Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Student
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Overall Score
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Assignments
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics?.students?.map((student) => (
                <tr key={student.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {student.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600">
                      {student.overall_score?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {student.completed_assignments}/{student.total_assignments}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.passing
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {student.passing ? 'Passing' : 'At Risk'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Tooltip content="View this student's detailed performance">
                      <button
                        onClick={() =>
                          router.push(`/analytics/student/${student.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Details
                      </button>
                    </Tooltip>

                    <Tooltip content="View summary of all assignments for this student">
                      <button
                        onClick={() =>
                          router.push(`/analytics/student/${student.id}/summary`)
                        }
                        className="text-purple-600 hover:text-purple-800 font-medium transition"
                      >
                        Summary
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}