import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from '@/services'; // Import the service function

export default function Register() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerUser({ firstname, lastname, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }


  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="shadow-md dark:bg-gray-850 max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="flex space-x-6">
              <div className="space-y-2 flex-1">
                <label htmlFor="firstname-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <Input
                  id="firstname-input"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex-1">
                <label htmlFor="lastname-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <Input
                  id="lastname-input"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="space-y-2">
              <label htmlFor="confirm-password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <Input
                id="confirm-password-input"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          <div className='p-3 h-5'>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
          <Button
            className="w-full mt-2"
            variant="secondary"
            type="button"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}