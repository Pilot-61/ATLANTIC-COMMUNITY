import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { signUp, signIn, signUpSchema, signInSchema, type SignUpData, type SignInData } from '../../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const handleSignIn = async (data: SignInData) => {
    setLoading(true);
    try {
      await signIn(data);
      toast.success('Welcome back!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      await signUp(data);
      toast.success('Account created successfully! Please check your email to verify your account.');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 w-full max-w-md mx-4 border border-red-500/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            {mode === 'signin' ? 'Welcome Back' : 'Join Atlantic RP'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...signInForm.register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                  placeholder="Enter your email"
                />
              </div>
              {signInForm.formState.errors.email && (
                <p className="text-red-400 text-sm mt-1">{signInForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...signInForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {signInForm.formState.errors.password && (
                <p className="text-red-400 text-sm mt-1">{signInForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...signUpForm.register('username')}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                    placeholder="Username"
                  />
                </div>
                {signUpForm.formState.errors.username && (
                  <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  {...signUpForm.register('displayName')}
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                  placeholder="Display Name"
                />
                {signUpForm.formState.errors.displayName && (
                  <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.displayName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...signUpForm.register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                  placeholder="Enter your email"
                />
              </div>
              {signUpForm.formState.errors.email && (
                <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...signUpForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {signUpForm.formState.errors.password && (
                <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.password.message}</p>
              )}
              <div className="mt-2 text-xs text-gray-400">
                Password must contain: 8+ characters, uppercase, lowercase, number, and special character
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="ml-2 text-red-400 hover:text-red-300 font-semibold"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;