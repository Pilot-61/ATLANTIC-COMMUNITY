import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  display_name?: string;
  username?: string;
  bio?: string;
  is_admin: boolean;
  banned?: boolean;
}

const UserManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true });
    if (error) toast.error('Failed to fetch users');
    else setUsers(data || []);
    setLoading(false);
  }

  async function updateUser(id: string, updates: Partial<Profile>) {
    const { error, data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id); // Use 'id' as the primary key
    console.log('Update result:', { error, data, id, updates });
    if (error) toast.error('Update failed: ' + error.message);
    else {
      toast.success('User updated');
      fetchUsers();
    }
  }

  const filtered = users.filter(u =>
    (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!profile?.is_admin) return <div className="p-8 text-center text-red-400">Admins only</div>;

  return (
  <div className="w-full min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black via-gray-900 to-black py-8 px-2 mt-20">
      <div className="w-full max-w-4xl bg-black/70 rounded-2xl shadow-2xl border border-gray-800 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-yellow-400" /> User Management
          </h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full md:w-72 pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                placeholder="Search by name or username"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-yellow-400 py-12 text-lg animate-pulse">Loading users...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No users found.</div>
            ) : (
              filtered.map(user => (
                <div
                  key={user.id}
                  className={`flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-xl p-4 shadow-lg hover:shadow-yellow-900/30 transition-shadow duration-200 ${user.banned ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center overflow-hidden border-2 border-yellow-500">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">{user.display_name || '-'}</span>
                        {user.is_admin && (
                          <span className="bg-gradient-to-r from-yellow-500 to-red-500 text-black text-xs px-2 py-1 rounded-full font-bold tracking-wide">ADMIN</span>
                        )}
                        {user.banned && (
                          <span className="bg-red-700 text-white text-xs px-2 py-1 rounded-full font-bold tracking-wide">BANNED</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">@{user.username || '-'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto justify-end">
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${user.is_admin ? 'bg-yellow-700 border-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-yellow-900'} ${user.id === profile.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => updateUser(user.id, { is_admin: !user.is_admin })}
                      disabled={user.id === profile.id}
                    >
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${user.banned ? 'bg-red-700 border-red-500 text-white hover:bg-red-800' : 'bg-gray-800 border-gray-700 text-red-400 hover:bg-red-900'} ${user.id === profile.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => updateUser(user.id, { banned: !user.banned })}
                      disabled={user.id === profile.id}
                    >
                      {user.banned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
