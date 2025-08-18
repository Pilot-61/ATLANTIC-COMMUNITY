import React from 'react';
import AuthModal from './AuthModal';


interface LoginPageProps {
  setCurrentPage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    if (!open) {
      setCurrentPage('home');
    }
  }, [open, setCurrentPage]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <AuthModal isOpen={open} onClose={() => setOpen(false)} initialMode="signin" />
    </div>
  );
};

export default LoginPage;
