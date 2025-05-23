import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loginUser } from '@/services';
import { User2, KeyRound, LogIn, XCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { token } = await loginUser(email, password);

      // Save the token in cookies
      document.cookie = `token=${token}; path=/; secure; samesite=strict`;

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-4">
        <LogIn className="h-10 w-10 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Login</h2>
          <p className="text-muted-foreground">
            Enter your credentials to access your account.
          </p>
        </div>
      </div>
      <Card className="shadow-md dark:bg-gray-850 max-w-md w-full">
        <CardContent className="space-y-4">
          <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label htmlFor="email-input" className="block text-sm font-medium flex items-center gap-1">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password-input" className="block text-sm font-medium flex items-center gap-1">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Password
                </label>
                <Input
                  id="password-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className='p-3 h-10'>
              {error && (
                <div className="flex items-center text-red-500 text-sm text-center gap-2 justify-center">
                  <XCircle className="h-4 w-4" /> {error}
                </div>
              )}
            </div>
          </form>
          <p className="text-sm text-center">
            Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}