import React, { useState } from 'react';
import type { UserProfile } from '../../types';
import { PageHeader } from '../layout/PageHeader';
import { User, Database, Download, Upload, Check, X } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onExportData,
  onImportData,
}) => {
  const [nameInput, setNameInput] = useState(profile.name);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Profile name cannot be empty.');
      return;
    }
    if (trimmed.length > 40) {
      setError('Profile name cannot exceed 40 characters.');
      return;
    }
    setError(null);
    onSaveProfile({ name: trimmed });
  };

  const handleCancel = () => {
    setNameInput(profile.name);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings & Data"
        subtitle="Manage your profile settings, workspace preferences, and data backups."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0EDE8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#F0EDE8]">
              <div className="w-10 h-10 rounded-2xl bg-[#EFEBFC] flex items-center justify-center text-[#7657D9]">
                <User className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2A2538]">Profile Details</h2>
                <p className="text-xs text-[#9E98AB]">Update your personal workspace name</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="profile-name-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[#6D677D] mb-1.5"
                >
                  Profile Name
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FCFAF8] border border-[#F0EDE8] text-sm font-semibold text-[#2A2538] focus:outline-none focus:border-[#7657D9] focus:bg-white transition-all"
                />
                {error && (
                  <p className="text-xs font-semibold text-red-500 mt-1.5">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-[#6D677D] hover:bg-[#F5F2EE] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#7657D9] hover:bg-[#6645C8] text-white text-xs font-bold shadow-md shadow-[#7657D9]/20 transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Data Management Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0EDE8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#F0EDE8]">
              <div className="w-10 h-10 rounded-2xl bg-[#EFEBFC] flex items-center justify-center text-[#7657D9]">
                <Database className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2A2538]">Data Backup & Restore</h2>
                <p className="text-xs text-[#9E98AB]">Export snapshot or restore workspace state</p>
              </div>
            </div>

            <p className="text-xs text-[#6D677D] leading-relaxed mb-6">
              Export your tasks, projects, and focus history into a portable JSON snapshot.
              You can import snapshot files anytime to restore your workspace.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/json"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onExportData}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#7657D9] hover:bg-[#6645C8] text-white text-xs font-bold shadow-md shadow-[#7657D9]/20 transition-all active:scale-95"
                title="Export workspace data to JSON"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Export Data</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#F5F2EE] hover:bg-[#EAE5E0] text-[#2A2538] text-xs font-bold transition-all active:scale-95"
                title="Import workspace data from JSON file"
              >
                <Upload className="w-4 h-4 text-[#7657D9] stroke-[2.5]" />
                <span>Import Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};