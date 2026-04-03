'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  member_count: number;
  last_checkin: string | null;
  my_role: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function GroupsClient({ initialGroups }: { initialGroups: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  // Create form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Join form
  const [inviteCode, setInviteCode] = useState('');

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else {
        setGroups((prev) => [...prev, {
          ...data.group,
          member_count: 1,
          last_checkin: null,
          my_role: 'admin',
        }]);
        setNewName('');
        setNewDesc('');
        setShowCreate(false);
      }
    } catch { setError('Failed to create group'); }
    setCreating(false);
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setJoining(true);
    setError('');
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else {
        // Refresh groups
        const groupsRes = await fetch('/api/groups');
        const groupsData = await groupsRes.json();
        setGroups(groupsData.groups || []);
        setInviteCode('');
        setShowJoin(false);
      }
    } catch { setError('Failed to join group'); }
    setJoining(false);
  }

  return (
    <div className="max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            handshake
          </span>
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Accountability Groups</h1>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body italic">
              &ldquo;A cord of three strands is not easily broken.&rdquo;
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); setError(''); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant transition-colors"
          >
            <span className="material-symbols-outlined text-sm">link</span>
            Join Group
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); setError(''); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create Group
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="mb-6 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
          <h2 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">group_add</span>
            Create a New Group
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Group name</label>
              <input
                type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Morning Accountability, Recovery Brothers"
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Description <span className="text-on-surface-variant font-normal">(optional)</span>
              </label>
              <textarea
                value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this group about?"
                rows={2} maxLength={500}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!newName.trim() || creating}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className="mb-6 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
          <h2 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-primary">link</span>
            Join a Group
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Invite code</label>
              <input
                type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter the 8-character invite code"
                maxLength={20}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowJoin(false)}
                className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Cancel
              </button>
              <button onClick={handleJoin} disabled={!inviteCode.trim() || joining}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {joining ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      {groups.length > 0 ? (
        <div className="space-y-4 stagger">
          {groups.map((group) => (
            <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-on-surface truncate">{group.name}</h3>
                      {group.my_role === 'admin' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">Admin</span>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">{group.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">group</span>
                        {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                      </span>
                      {group.last_checkin && (
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          Last check-in {timeAgo(group.last_checkin)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg ml-2 mt-1">chevron_right</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary">diversity_3</span>
          </div>
          <h2 className="text-lg font-headline font-semibold text-on-surface mb-2">
            Stronger Together
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6 font-body">
            Start a group with friends, mentors, or your recovery community.
            Share anonymized focus boards, check in daily, and hold each other accountable
            without exposing personal details.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => { setShowJoin(true); setShowCreate(false); setError(''); }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-label font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-base">link</span>
              Join a Group
            </button>
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); setError(''); }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-label font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Create a Group
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-6 italic font-body">
            &ldquo;A cord of three strands is not quickly broken.&rdquo; &mdash; Ecclesiastes 4:12
          </p>
        </div>
      )}
    </div>
  );
}
