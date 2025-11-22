'use client';

import { useState, useEffect } from 'react';
import featureFlagsApi, { FeatureFlag, CreateFeatureFlagDto } from '@/lib/api/featureFlags';
import { 
  Flag, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Shield, 
  Percent,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export default function FeatureFlagsManager() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [showWhitelistModal, setShowWhitelistModal] = useState<FeatureFlag | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateFeatureFlagDto>({
    key: '',
    name: '',
    description: '',
    enabled: true,
    targeting: {
      emails: [],
      userIds: [],
      roles: [],
      percentage: 0
    }
  });

  const [whitelistForm, setWhitelistForm] = useState({
    emails: '',
    userIds: ''
  });

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await featureFlagsApi.getAllFlags();
      setFlags(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    try {
      await featureFlagsApi.toggleFlag(key);
      await loadFlags();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to toggle flag');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await featureFlagsApi.createFlag(formData);
      await loadFlags();
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create flag');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlag) return;
    
    try {
      await featureFlagsApi.updateFlag(editingFlag.key, formData);
      await loadFlags();
      setEditingFlag(null);
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update flag');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;
    
    try {
      await featureFlagsApi.deleteFlag(key);
      await loadFlags();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete flag');
    }
  };

  const handleAddToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showWhitelistModal) return;

    try {
      const emails = whitelistForm.emails.split(',').map(e => e.trim()).filter(e => e);
      const userIds = whitelistForm.userIds.split(',').map(id => id.trim()).filter(id => id);

      await featureFlagsApi.addToWhitelist(showWhitelistModal.key, { emails, userIds });
      await loadFlags();
      setShowWhitelistModal(null);
      setWhitelistForm({ emails: '', userIds: '' });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to add to whitelist');
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      enabled: true,
      targeting: {
        emails: [],
        userIds: [],
        roles: [],
        percentage: 0
      }
    });
  };

  const openEditModal = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      targeting: flag.targeting
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <span className="text-red-800">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Flag className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feature Flags</h2>
            <p className="text-gray-600">Manage feature flags and canary deployments</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Flag</span>
        </button>
      </div>

      {/* Flags List */}
      <div className="grid grid-cols-1 gap-4">
        {flags.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No feature flags yet. Create one to get started!</p>
          </div>
        ) : (
          flags.map((flag) => (
            <div
              key={flag._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                      {flag.key}
                    </span>
                    <button
                      onClick={() => handleToggle(flag.key)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        flag.enabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {flag.enabled ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{flag.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{flag.description}</p>

                  {/* Targeting Info */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    {flag.targeting.emails.length > 0 && (
                      <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        <Mail className="h-3 w-3" />
                        <span>{flag.targeting.emails.length} emails</span>
                      </div>
                    )}
                    {flag.targeting.userIds.length > 0 && (
                      <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                        <Users className="h-3 w-3" />
                        <span>{flag.targeting.userIds.length} users</span>
                      </div>
                    )}
                    {flag.targeting.roles.length > 0 && (
                      <div className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-1 rounded">
                        <Shield className="h-3 w-3" />
                        <span>{flag.targeting.roles.join(', ')}</span>
                      </div>
                    )}
                    {flag.targeting.percentage > 0 && (
                      <div className="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                        <Percent className="h-3 w-3" />
                        <span>{flag.targeting.percentage}% rollout</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setShowWhitelistModal(flag)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="Manage whitelist"
                  >
                    <Users className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(flag)}
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(flag.key)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                {flag.lastToggledAt && (
                  <span>Last toggled: {new Date(flag.lastToggledAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFlag) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
              </h3>
            </div>
            <form onSubmit={editingFlag ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="admin-panel"
                  disabled={!!editingFlag}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Admin Panel Feature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enables access to the admin panel"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Enabled by default
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingFlag(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {editingFlag ? 'Update' : 'Create'} Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Whitelist Modal */}
      {showWhitelistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Manage Whitelist: {showWhitelistModal.name}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Current Whitelist */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Current Targeting</h4>
                <div className="space-y-2">
                  {showWhitelistModal.targeting.emails.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Emails:</p>
                      <div className="flex flex-wrap gap-1">
                        {showWhitelistModal.targeting.emails.map((email, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {showWhitelistModal.targeting.userIds.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-1">User IDs:</p>
                      <div className="flex flex-wrap gap-1">
                        {showWhitelistModal.targeting.userIds.map((id, idx) => (
                          <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Whitelist Form */}
              <form onSubmit={handleAddToWhitelist} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Emails (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={whitelistForm.emails}
                    onChange={(e) => setWhitelistForm({ ...whitelistForm, emails: e.target.value })}
                    placeholder="user1@example.com, user2@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add User IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={whitelistForm.userIds}
                    onChange={(e) => setWhitelistForm({ ...whitelistForm, userIds: e.target.value })}
                    placeholder="507f1f77bcf86cd799439011, 507f191e810c19729de860ea"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWhitelistModal(null);
                      setWhitelistForm({ emails: '', userIds: '' });
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Add to Whitelist
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
