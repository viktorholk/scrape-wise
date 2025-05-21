import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUser } from '@/services';
import { useUser } from '@/UserContext'; // Import useUser

const Settings = () => {
    const { user } = useUser(); // Get user from context

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Set default values from user context
    useEffect(() => {
        if (user) {
            setFirstName(user.firstname || '');
            setLastName(user.lastname || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateUser({ firstname: firstName, lastname: lastName, password });
            setSuccess('Settings updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
            <Card className="shadow-md dark:bg-gray-850 max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-xl text-center">User Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    <div className="space-y-2">
                        <label htmlFor="first-name-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                        </label>
                        <Input
                            id="first-name-input"
                            type="text"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="last-name-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                        </label>
                        <Input
                            id="last-name-input"
                            type="text"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <Input
                            id="password-input"
                            type="password"
                            placeholder="Enter your new password"
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
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSave} className="w-full" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;