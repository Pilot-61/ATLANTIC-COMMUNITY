import React from 'react';
import AuthModal from './AuthModal';

const LoginPage: React.FC = () => {
  // Always open the AuthModal in login mode
  const [open, setOpen] = React.useState(true);
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <AuthModal isOpen={open} onClose={() => setOpen(false)} initialMode="signin" />
    </div>
  );
};

export default LoginPage;
