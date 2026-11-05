/**
 * AccountSwitcherModal Component
 * Allows logging in as any specific individual account with distinct authority and dashboard segregation
 * Design Variation 3: Deep carbon theme, Space Mono metadata, Phosphor accents
 */

import React from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { User, UserRole } from '../types';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Truck, 
  BarChart3, 
  X, 
  Check, 
  ArrowRight
} from 'lucide-react';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose
}) => {
  const { users, currentUser, loginAsUser, residents, collectors } = useWasteApp();

  if (!isOpen) return null;

  const getRoleTag = (role: UserRole) => {
    switch (role) {
      case 'resident':
        return <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase">[ RESIDENT ]</span>;
      case 'collector':
        return <span className="font-mono-tech text-[10px] text-[#38bdf8] uppercase">[ COLLECTOR ]</span>;
      case 'admin':
        return <span className="font-mono-tech text-[10px] text-[#fbbf24] uppercase">[ ADMIN ]</span>;
      case 'leader':
        return <span className="font-mono-tech text-[10px] text-[#c084fc] uppercase">[ LOCAL LEADER ]</span>;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'resident':
        return <UserCheck className="w-4 h-4 text-[#5ef38c]" />;
      case 'collector':
        return <Truck className="w-4 h-4 text-[#38bdf8]" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />;
      case 'leader':
        return <BarChart3 className="w-4 h-4 text-[#c084fc]" />;
    }
  };

  const getUserDetails = (u: User) => {
    if (u.role === 'resident') {
      const r = residents.find(res => res.user_id === u.id);
      return `Plot ${r?.household_no || 'N/A'} • ${r?.zone_name || 'Nabutiti'}`;
    }
    if (u.role === 'collector') {
      const c = collectors.find(col => col.user_id === u.id);
      return `Vehicle: ${c?.vehicle_reg_no || 'Tipper'} • ${c?.assigned_zone || 'Zone B'}`;
    }
    if (u.role === 'admin') {
      return 'Sanitation & Dispatch Desk • Makindye Division';
    }
    if (u.role === 'leader') {
      return 'LC1 Chairperson • Nabutiti Village Council';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/[0.04] border border-[#5ef38c]/40 text-[#5ef38c]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="sys-tag">[ ACCESS CONTROL &bull; RBAC 2.0 ]</div>
              <h3 className="font-syne font-bold text-lg uppercase text-[var(--ink)] leading-tight">
                Account Authority &amp; Session Switcher
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Selection List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-[var(--ink-secondary)] font-mono-tech mb-2">
            SELECT AN INDIVIDUAL PERSON TO LOG IN WITH THEIR ISOLATED DASHBOARD AUTHORITY:
          </p>

          {users.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => {
                  loginAsUser(u.id);
                  onClose();
                }}
                className={`p-3.5 border transition cursor-pointer flex items-center justify-between ${
                  isCurrent 
                    ? 'border-[#5ef38c] bg-[#5ef38c]/10' 
                    : 'border-[var(--border)] bg-[var(--surface-muted)] hover:border-[#5ef38c]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/[0.04] border border-[var(--border)]">
                    {getRoleIcon(u.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--ink)] text-sm">{u.name}</span>
                      {getRoleTag(u.role)}
                    </div>
                    <div className="text-[11px] text-[rgba(248,247,244,0.55)] mt-0.5">
                      {getUserDetails(u)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono-tech text-xs">
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-[#5ef38c] font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className="text-[var(--ink-muted)] hover:text-[#5ef38c] flex items-center gap-1 text-[11px]">
                      <span>SWITCH</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between font-mono-tech text-[10px] text-[var(--ink-muted)]">
          <span>STRICT RBAC GATEKEEPER APPLIED</span>
          <button 
            onClick={onClose}
            className="text-[#5ef38c] hover:underline uppercase cursor-pointer"
          >
            [ CLOSE ]
          </button>
        </div>

      </div>
    </div>
  );
};
