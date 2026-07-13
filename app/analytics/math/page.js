'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/Tooltip';

export default function MathAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/math?range=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const res = await fetch(`/api/analytics/math/export?range=${timeRange}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `math-analytics-${timeRange}-${Date.now()}.pdf`;
      a.click();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Mathematics Analytics
          </h1>
          <div className="flex gap-3">
            <Tooltip content="Return to admin dashboard">
              <button
                onClick={() => router.push('/admin')}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
              >
                ← Back
              </button>
            </Tooltip>

            <Tooltip content="Generate and download analytics report as PDF">
              <button
                onClick={handleExportReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Export Report
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Time Range</h2>
          <div className="flex gap-2">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <Tooltip
                key={range}
                content={`View analytics for the past ${range}`}
              >
                <button
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm mb-2">Total Assignments</p>
            <p className="text-3xl font-bold text-slate-900">
              {analytics?.total_assignments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm mb-2">Total Responses</p>
            <p className="text-3xl font-bold text-blue-600">
              {analytics?.total_responses}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm mb-2">Average Score</p>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.average_score?.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {analytics?.success_rate?.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Topic
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Success
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topics?.map((topic) => (
                <tr key={topic.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {topic.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {topic.attempt_count}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {topic.avg_score?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-600">
                      {topic.success_rate?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Tooltip content="View detailed analysis for this topic">
                      <button
                        onClick={() =>
                          router.push(`/analytics/math/${topic.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Analyze
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