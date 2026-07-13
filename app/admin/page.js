'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/Tooltip';

export default function AdminPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assignments');
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete assignment');
      await fetchAssignments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/assignments/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignments-export-${Date.now()}.csv`;
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
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Tooltip content="Create a new assignment or assessment">
              <button
                onClick={() => router.push('/admin/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                + New Assignment
              </button>
            </Tooltip>

            <Tooltip content="Download all assignment data as CSV">
              <button
                onClick={handleExportData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Export Data
              </button>
            </Tooltip>

            <Tooltip content="Reload the list of assignments">
              <button
                onClick={fetchAssignments}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {assignment.title}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {assignment.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Tooltip content="Edit assignment details and questions">
                      <button
                        onClick={() =>
                          router.push(`/admin/edit/${assignment.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Edit
                      </button>
                    </Tooltip>

                    <Tooltip content="View analytics and student responses">
                      <button
                        onClick={() =>
                          router.push(`/analytics/${assignment.id}`)
                        }
                        className="text-purple-600 hover:text-purple-800 font-medium transition"
                      >
                        Analytics
                      </button>
                    </Tooltip>

                    <Tooltip content="Preview how students will see this assignment">
                      <button
                        onClick={() =>
                          router.push(`/assignments/${assignment.id}`)
                        }
                        className="text-green-600 hover:text-green-800 font-medium transition"
                      >
                        Preview
                      </button>
                    </Tooltip>

                    <Tooltip content="Permanently delete this assignment">
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-800 font-medium transition"
                      >
                        Delete
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-slate-600 mb-4">No assignments yet.</p>
            <Tooltip content="Create a new assignment or assessment">
              <button
                onClick={() => router.push('/admin/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Create First Assignment
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}