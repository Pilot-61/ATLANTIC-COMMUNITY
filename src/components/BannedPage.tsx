import React from 'react';
import { supabase } from '../lib/supabase';

const BannedPage: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="bg-gradient-to-br from-red-900 to-black p-8 rounded-2xl shadow-2xl border border-red-700/40 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-400">You Are Banned</h1>
        <p className="mb-6 text-lg text-gray-300">Your account has been banned by an administrator.<br/>If you believe this is a mistake, please contact support.</p>
        <span className="text-sm text-gray-500 block mb-6">Access to the site is restricted.</span>
        <button
          onClick={handleLogout}
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default BannedPage;
