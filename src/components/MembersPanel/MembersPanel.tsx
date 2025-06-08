import React from 'react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  roleTitle?: string;
  status?: 'online' | 'away' | 'offline';
}

interface MembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

const MembersPanel: React.FC<MembersPanelProps> = ({ isOpen, onClose, members }) => {
  // Group members by role
  const owner = members.find(member => member.role === 'owner');
  const admins = members.filter(member => member.role === 'admin');
  const regularMembers = members.filter(member => member.role === 'member');

  const renderMember = (member: Member) => (
    <div
      key={member.id}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white border-2 border-gray-800 ${
            typeof member.avatar === 'string' && member.avatar.startsWith('http')
              ? ''
              : 'bg-gray-600'
          }`}
          style={{
            backgroundImage:
              typeof member.avatar === 'string' && member.avatar.startsWith('http')
                ? `url(${member.avatar})`
                : undefined,
            backgroundSize: 'cover',
          }}
        >
          {!(typeof member.avatar === 'string' && member.avatar.startsWith('http')) &&
            member.avatar}
        </div>
        {member.status && (
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
              member.status === 'online'
                ? 'bg-green-500'
                : member.status === 'away'
                ? 'bg-yellow-500'
                : 'bg-gray-500'
            }`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{member.name}</p>
        {member.roleTitle && (
          <p className="text-xs text-gray-400 truncate">{member.roleTitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 shadow-xl transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Miembros del Proyecto</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Members List */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
        {/* Owner Section */}
        {owner && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Propietario
            </h3>
            {renderMember(owner)}
          </div>
        )}

        {/* Admins Section */}
        {admins.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Administradores
            </h3>
            {admins.map(renderMember)}
          </div>
        )}

        {/* Members Section */}
        {regularMembers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Miembros
            </h3>
            {regularMembers.map(renderMember)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersPanel; 