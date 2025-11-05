import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Real-time data from Firestore
  const [joinRequests, setJoinRequests] = useState([]);
  const [members, setMembers] = useState([]);

  // Check admin status and set up real-time listeners
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Check if user is admin from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const isAdminUser = userData.role === 'admin' || userData.role === 'owner';
            setIsAdmin(isAdminUser);

            if (!isAdminUser) {
              setLoading(false);
              return; // Don't set up listeners if not admin
            }
          } else {
            // User document doesn't exist, not admin
            setIsAdmin(false);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          setError('Failed to verify admin permissions');
          setIsAdmin(false);
        }

        setLoading(false);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Set up real-time listener for join requests
  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(
      collection(db, 'joinRequests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setJoinRequests(requests);
    }, (err) => {
      console.error('Error fetching join requests:', err);
      setError('Failed to load join requests');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Set up real-time listener for members
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersList = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          usersList.push({
            uid: doc.id,
            ...userData,
            // Convert Firestore timestamp to readable date
            joinDate: userData.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || 'N/A'
          });
        });
        setMembers(usersList);
      },
      (err) => {
        console.error('Error fetching members:', err);
        setError('Failed to load members');
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Approve join request
  const approveRequest = async (requestId) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      // Update request status to approved
      const requestRef = doc(db, 'joinRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        processedDate: serverTimestamp(),
        processedBy: user.uid
      });

      // Create new user document
      const displayName = request.name.split(' ')[0].toLowerCase();
      await addDoc(collection(db, 'users'), {
        email: request.email,
        displayName: displayName,
        role: 'member',
        level: 1,
        xp: 0,
        joinDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      alert(`✅ ${request.name} approved! They can now sign up with their email.`);

      // Optional: Call email notification endpoint if available
      // You can uncomment this when server endpoint is ready
      /*
      try {
        await fetch('/api/admin/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: request.email, name: request.name })
        });
      } catch (emailErr) {
        console.log('Email notification failed:', emailErr);
      }
      */
    } catch (err) {
      console.error('Error approving request:', err);
      alert('❌ Failed to approve request. Please try again.');
    }
  };

  // Reject join request
  const rejectRequest = async (requestId) => {
    if (!confirm('Reject this request?')) return;

    try {
      const requestRef = doc(db, 'joinRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        processedDate: serverTimestamp(),
        processedBy: user.uid
      });

      alert('❌ Request rejected.');

      // Optional: Call email notification endpoint if available
      /*
      const request = joinRequests.find(r => r.id === requestId);
      if (request) {
        try {
          await fetch('/api/admin/send-rejection-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: request.email, name: request.name })
          });
        } catch (emailErr) {
          console.log('Email notification failed:', emailErr);
        }
      }
      */
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('❌ Failed to reject request. Please try again.');
    }
  };

  // Change member role
  const changeMemberRole = async (uid, newRole) => {
    if (!confirm(`Change role to ${newRole}?`)) return;

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role: newRole
      });
      alert(`✅ Role updated to ${newRole}`);
    } catch (err) {
      console.error('Error updating role:', err);
      alert('❌ Failed to update role. Please try again.');
    }
  };

  // Remove member
  const removeMember = async (uid) => {
    const member = members.find(m => m.uid === uid);
    if (member?.role === 'owner') {
      alert('❌ Cannot remove owner!');
      return;
    }

    if (!confirm('Remove this member? This cannot be undone.')) return;

    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
      alert('✅ Member removed.');
    } catch (err) {
      console.error('Error removing member:', err);
      alert('❌ Failed to remove member. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-matrix-green text-xl">
          <span className="animate-spin inline-block">⚙️</span> Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-terminal-muted mb-6">{error}</p>
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
  // Format the request date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().split('T')[0];
    }
    return timestamp;
  };

  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-terminal-text mb-1">{request.name}</h3>
          <p className="text-terminal-muted text-sm">{request.email}</p>
          <p className="text-xs text-terminal-muted mt-1">
            Requested on {formatDate(request.requestDate)}
          </p>
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