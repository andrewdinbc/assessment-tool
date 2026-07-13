'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Tooltip from '@/components/Tooltip';

export default function AssignmentAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.assignmentId) {
      fetchAnalytics();
    }
  }, [params.assignmentId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/${params.assignmentId}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = async () => {
    try {
      const res = await fetch(
        `/api/analytics/${params.assignmentId}/export`
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${params.assignmentId}-${Date.now()}.csv`;
      a.click();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetResponses = async () => {
    if (
      !confirm(
        'Are you sure? This will delete all student responses for this assignment.'
      )
    )
      return;

    try {
      const res = await fetch(
        `/api/analytics/${params.assignmentId}/reset`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed to reset responses');
      await fetchAnalytics();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!analytics) return <div className="p-8">No data available</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {analytics.title} — Analytics
            </h1>
            <p className="text-slate-600 mt-2">
              {analytics.response_count} responses
            </p>
          </div>
          <div className="flex gap-3">
            <Tooltip content="Go back to admin dashboard">
              <button
                onClick={() => router.push('/admin')}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
              >
                ← Back
              </button>
            </Tooltip>

            <Tooltip content="Export all student responses as CSV">
              <button
                onClick={handleExportResults}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Export Results
              </button>
            </Tooltip>

            <Tooltip content="Refresh analytics data">
              <button
                onClick={fetchAnalytics}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Refresh
              </button>
            </Tooltip>

            <Tooltip content="Delete all responses and reset analytics">
              <button
                onClick={handleResetResponses}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Reset
              </button>
            </Tooltip>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Question Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {analytics.questions?.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-slate-900 mb-2">
                {question.title}
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-600">Correct:</span>{' '}
                  <span className="font-bold text-green-600">
                    {question.correct_count}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Incorrect:</span>{' '}
                  <span className="font-bold text-red-600">
                    {question.incorrect_count}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Success Rate:</span>{' '}
                  <span className="font-bold text-blue-600">
                    {question.success_rate?.toFixed(1)}%
                  </span>
                </p>
              </div>
              <Tooltip content="View detailed responses for this question">
                <button
                  onClick={() =>
                    router.push(
                      `/analytics/${params.assignmentId}/question/${question.id}`
                    )
                  }
                  className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded transition font-medium text-sm"
                >
                  View Details
                </button>
              </Tooltip>
            </div>
          ))}
        </div>

        {/* Student Responses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Student Responses
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Student
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Score
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Submitted
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.responses?.map((response) => (
                  <tr key={response.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">
                      {response.student_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-blue-600">
                        {response.score}/{response.total_points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(response.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Tooltip content="Review this student's complete responses">
                        <button
                          onClick={() =>
                            router.push(
                              `/analytics/${params.assignmentId}/response/${response.id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          Review
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
    </div>
  );
}