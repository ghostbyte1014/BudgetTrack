import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useBudget } from '../contexts/BudgetContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wallet, Loader2 } from 'lucide-react';
import { WelcomeScreen } from './WelcomeScreen';
import { supabase } from '../../lib/supabase';

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useBudget();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        login(data.user?.user_metadata?.name || 'User', email, data.user?.id);
        navigate('/dashboard');
      } else {
        // Sign Up
        if (!name) throw new Error('First name is required for registration.');

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            }
          }
        });
        if (error) throw error;

        // Show welcome screen and set onboarding timestamp on new signup
        localStorage.setItem('signup_timestamp', Date.now().toString());
        login(name, email, data.user?.id);
        setShowWelcome(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    navigate('/dashboard');
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BudgetFlow</h1>
          <p className="text-zinc-400">Smart carry-over budgeting</p>
        </div>

        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isLogin
                ? 'Sign in to continue managing your finances'
                : 'Create your account to start budgeting'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-200">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#09090b] border-zinc-700 text-white placeholder:text-zinc-500"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#09090b] border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#09090b] border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                  minLength={6}
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrorMsg('');
                  }}
                  className="text-sm text-zinc-400 hover:text-zinc-300"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}