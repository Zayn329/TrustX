import React, { useState } from 'react';
import { X, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { Bounty, SeverityLevel } from '../../domain/types';
import { createBounty } from '../../services/firestoreService';

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBountyModal: React.FC<CreateBountyModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<Omit<Bounty, 'id'>>({
    title: '',
    organizationId: '',
    organizationName: '',
    organizationTrustScore: 50,
    severity: 'Low' as SeverityLevel,
    rewardAmount: 0,
    rewardCurrency: 'USD',
    scope: [],
    rules: [],
    deadline: '',
    verificationRequirements: [],
    status: 'active' as const,
    escrowId: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (!form.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }
    if (!form.organizationId.trim()) {
      setError('Organization ID is required');
      setLoading(false);
      return;
    }
    if (!form.organizationName.trim()) {
      setError('Organization name is required');
      setLoading(false);
      return;
    }
    if (form.organizationTrustScore < 0 || form.organizationTrustScore > 100) {
      setError('Organization trust score must be between 0 and 100');
      setLoading(false);
      return;
    }
    if (form.rewardAmount <= 0) {
      setError('Reward amount must be greater than 0');
      setLoading(false);
      return;
    }
    if (form.scope.length === 0) {
      setError('Scope must not be empty');
      setLoading(false);
      return;
    }
    if (form.rules.length === 0) {
      setError('Rules must not be empty');
      setLoading(false);
      return;
    }
    if (!form.deadline.trim()) {
      setError('Deadline is required');
      setLoading(false);
      return;
    }
    if (form.verificationRequirements.length === 0) {
      setError('Verification requirements must not be empty');
      setLoading(false);
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }

    try {
      await createBounty(form);
      onClose();
      // Reset form after successful submission
      setForm({
        title: '',
        organizationId: '',
        organizationName: '',
        organizationTrustScore: 50,
        severity: 'Low' as SeverityLevel,
        rewardAmount: 0,
        rewardCurrency: 'USD',
        scope: [],
        rules: [],
        deadline: '',
        verificationRequirements: [],
        status: 'active' as const,
        escrowId: '',
        description: ''
      });
    } catch (err) {
      setError('Failed to create bounty. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
      >
        <div
          className="bg-[#0b1220] border border-slate-600/40 rounded-[1.75rem] max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">Create Bounty</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.05em] text-slate-100">New Bounty</h1>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Enter bounty title"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Organization ID</label>
                <input
                  value={form.organizationId}
                  onChange={e => setForm(prev => ({ ...prev, organizationId: e.target.value }))}
                  className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter organization ID"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Organization Name</label>
                <input
                  value={form.organizationName}
                  onChange={e => setForm(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter organization name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Organization Trust Score (0-100)</label>
              <input
                type="number"
                value={form.organizationTrustScore}
                onChange={e => {
                  const value = parseInt(e.target.value) || 0;
                  setForm(prev => ({ ...prev, organizationTrustScore: value }));
                }}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm(prev => ({ ...prev, severity: e.target.value as SeverityLevel }))}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {['Low', 'Medium', 'High', 'Critical'].map(severity => (
                  <option key={severity} value={severity as SeverityLevel}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Reward Amount (USD)</label>
                <input
                  type="number"
                  value={form.rewardAmount}
                  onChange={e => setForm(prev => ({ ...prev, rewardAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Reward Currency</label>
                <input
                  value={form.rewardCurrency}
                  onChange={e => setForm(prev => ({ ...prev, rewardCurrency: e.target.value }))}
                  className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. USD"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Scope (one per line)</label>
              <textarea
                value={form.scope.join('\n')}
                onChange={e => {
                  const lines = e.target.value
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                  setForm(prev => ({ ...prev, scope: lines }));
                }}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 h-20"
                placeholder="Enter scope items, one per line"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Rules (one per line)</label>
              <textarea
                value={form.rules.join('\n')}
                onChange={e => {
                  const lines = e.target.value
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                  setForm(prev => ({ ...prev, rules: lines }));
                }}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 h-20"
                placeholder="Enter rules, one per line"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Deadline (YYYY-MM-DD)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Verification Requirements (one per line)</label>
              <textarea
                value={form.verificationRequirements.join('\n')}
                onChange={e => {
                  const lines = e.target.value
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                  setForm(prev => ({ ...prev, verificationRequirements: lines }));
                }}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 h-20"
                placeholder="Enter verification requirements, one per line"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-950/70 border border-slate-700/50 rounded-xl pl-3 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 h-32"
                placeholder="Enter bounty description"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-xl">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className={`w-full disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2" />
                ) : null}
                Create Bounty
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Close on backdrop click */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />
    </>
  );
};