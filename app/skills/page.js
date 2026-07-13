'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/Tooltip';

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error('Failed to fetch skills');
      const data = await res.json();
      setSkills(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillName,
          description: newSkillDescription,
        }),
      });
      if (!res.ok) throw new Error('Failed to add skill');
      setNewSkillName('');
      setNewSkillDescription('');
      await fetchSkills();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!confirm('Delete this skill? This may affect existing assignments.'))
      return;

    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete skill');
      await fetchSkills();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSkill = (id) => {
    router.push(`/skills/edit/${id}`);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          Skills Management
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add New Skill Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Skill</h2>
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g., Problem Solving"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newSkillDescription}
                  onChange={(e) => setNewSkillDescription(e.target.value)}
                  placeholder="Brief description of the skill"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <Tooltip content="Add this skill to your skill library">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                  >
                    Add Skill
                  </button>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>

        {/* Skills List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Skill Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Assignments
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {skill.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {skill.description || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {skill.assignment_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Tooltip content="Modify skill name and description">
                      <button
                        onClick={() => handleEditSkill(skill.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        Edit
                      </button>
                    </Tooltip>

                    <Tooltip content="View assignments that assess this skill">
                      <button
                        onClick={() =>
                          router.push(`/skills/${skill.id}/assignments`)
                        }
                        className="text-purple-600 hover:text-purple-800 font-medium transition"
                      >
                        View
                      </button>
                    </Tooltip>

                    <Tooltip content="Remove this skill from your library">
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
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

        {skills.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-slate-600">No skills created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}