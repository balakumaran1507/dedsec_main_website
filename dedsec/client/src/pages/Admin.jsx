import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { 
  Shield,
  Users,
  UserCheck,
  UserX,
  Crown,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Demo join requests (later from Firebase)
  const [joinRequests, setJoinRequests] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      message: 'I\'m a cybersecurity student interested in CTFs and want to learn from your team!',
      date: '2025-10-14',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      message: 'Experienced pentester, competed in multiple CTFs. Would love to join!',
      date: '2025-10-13',
      status: 'pending'
    }
  ]);

  // Demo members (later from Firebase)
  const [members, setMembers] = useState([
    {
      uid: '1',
      email: 'hacker@dedsec.net',
      displayName: 'you',
      role: 'owner',
      level: 3,
      xp: 350,
      joinDate: '2025-10-10'
    },
    {
      uid: '2',
      email: 'teammate1@dedsec.net',
      displayName: 'teammate1',
      role: 'member',
      level: 5,
      xp: 1200,
      joinDate: '2025-09-15'
    },
    {
      uid: '3',
      email: 'teammate2@dedsec.net',
      displayName: 'teammate2',
      role: 'admin',
      level: 4,
      xp: 850,
      joinDate: '2025-09-20'
    }
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // TODO: Check if user is admin from Firebase
        setIsAdmin(true); // For now, everyone is admin for testing
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Approve join request
  const approveRequest = (requestId) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status
    setJoinRequests(prev =>
      prev.map(r =>
        r.id === requestId ? { ...r, status: 'approved' } : r
      )
    );

    // Add to members (in real app, create Firebase user)
    const newMember = {
      uid: Date.now().toString(),
      email: request.email,
      displayName: request.name.split(' ')[0].toLowerCase(),
      role: 'member',
      level: 1,
      xp: 0,
      joinDate: new Date().toISOString().split('T')[0]
    };

    setMembers(prev => [...prev, newMember]);
    alert(`✅ ${request.name} approved! Welcome email sent.`);
  };

  // Reject join request
  const rejectRequest = (requestId) => {
    if (confirm('Reject this request?')) {
      setJoinRequests(prev =>
        prev.map(r =>
          r.id === requestId ? { ...r, status: 'rejected' } : r
        )
      );
      alert('❌ Request rejected.');
    }
  };

  // Change member role
  const changeMemberRole = (uid, newRole) => {
    if (confirm(`Change role to ${newRole}?`)) {
      setMembers(prev =>
        prev.map(m =>
          m.uid === uid ? { ...m, role: newRole } : m
        )
      );
      alert(`✅ Role updated to ${newRole}`);
    }
  };

  // Remove member
  const removeMember = (uid) => {
    const member = members.find(m => m.uid === uid);
    if (member?.role === 'owner') {
      alert('❌ Cannot remove owner!');
      return;
    }

    if (confirm('Remove this member?')) {
      setMembers(prev => prev.filter(m => m.uid !== uid));
      alert('✅ Member removed.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-matrix-green text-xl">
          <span className="animate-spin inline-block">⚙️</span> Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-terminal-muted mb-6">You don't have admin permissions.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pendingRequests = joinRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-terminal-muted hover:text-matrix-green transition-colors flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-matrix-green mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10" />
            Admin Panel
          </h1>
          <p className="text-terminal-muted">Manage members and join requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Total Members</span>
              <Users className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">{members.length}</div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Pending Requests</span>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400">{pendingRequests.length}</div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Admins</span>
              <Crown className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">
              {members.filter(m => m.role === 'admin' || m.role === 'owner').length}
            </div>
          </div>
        </div>

        {/* Join Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-matrix-green mb-4">Join Requests</h2>
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <JoinRequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => approveRequest(request.id)}
                  onReject={() => rejectRequest(request.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div>
          <h2 className="text-2xl font-bold text-matrix-green mb-4">Team Members</h2>
          <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-terminal-bg border-b border-terminal-border">
                <tr>
                  <th className="text-left p-4 text-terminal-muted text-sm font-semibold">Member</th>
                  <th className="text-left p-4 text-terminal-muted text-sm font-semibold">Role</th>
                  <th className="text-left p-4 text-terminal-muted text-sm font-semibold">Level</th>
                  <th className="text-left p-4 text-terminal-muted text-sm font-semibold">XP</th>
                  <th className="text-left p-4 text-terminal-muted text-sm font-semibold">Joined</th>
                  <th className="text-left p-4 text-terminal-muted text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border">
                {members.map(member => (
                  <MemberRow
                    key={member.uid}
                    member={member}
                    onChangeRole={changeMemberRole}
                    onRemove={removeMember}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Join Request Card
function JoinRequestCard({ request, onApprove, onReject }) {
  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-terminal-text mb-1">{request.name}</h3>
          <p className="text-terminal-muted text-sm">{request.email}</p>
          <p className="text-xs text-terminal-muted mt-1">Requested on {request.date}</p>
        </div>
      </div>

      <div className="bg-terminal-bg border border-terminal-border rounded p-4 mb-4">
        <p className="text-terminal-text text-sm">{request.message}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onApprove}
          className="flex-1 bg-matrix-green text-terminal-bg py-2 rounded font-semibold hover:bg-matrix-dark transition-colors flex items-center justify-center gap-2"
        >
          <UserCheck size={18} />
          Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-red-900 text-red-200 py-2 rounded font-semibold hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
        >
          <UserX size={18} />
          Reject
        </button>
      </div>
    </div>
  );
}

// Member Row
function MemberRow({ member, onChangeRole, onRemove }) {
  const getRoleBadge = (role) => {
    const styles = {
      owner: 'bg-red-900/30 text-red-400 border-red-700',
      admin: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
      member: 'bg-matrix-dim text-matrix-green border-matrix-green'
    };
    return (
      <span className={`text-xs px-3 py-1 rounded border ${styles[role]}`}>
        {role === 'owner' && '👑 '}
        {role === 'admin' && '⚡ '}
        {role.toUpperCase()}
      </span>
    );
  };

  return (
    <tr className="hover:bg-terminal-bg transition-colors">
      <td className="p-4">
        <div>
          <div className="font-semibold text-terminal-text">{member.displayName}</div>
          <div className="text-xs text-terminal-muted">{member.email}</div>
        </div>
      </td>
      <td className="p-4">{getRoleBadge(member.role)}</td>
      <td className="p-4 text-terminal-text">Level {member.level}</td>
      <td className="p-4 text-matrix-green font-semibold">{member.xp} XP</td>
      <td className="p-4 text-terminal-muted text-sm">{member.joinDate}</td>
      <td className="p-4">
        {member.role !== 'owner' && (
          <div className="flex gap-2">
            <select
              onChange={(e) => onChangeRole(member.uid, e.target.value)}
              value={member.role}
              className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-terminal-text text-xs"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={() => onRemove(member.uid)}
              className="text-red-500 hover:text-red-400 transition-colors"
              title="Remove"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default Admin;