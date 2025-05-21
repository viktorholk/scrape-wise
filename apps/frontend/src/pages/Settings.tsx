import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateUser } from '@/services';
import { useUser } from '@/UserContext';

const Settings = () => {
    const { user } = useUser();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstname || '');
            setLastName(user.lastname || '');
        }
    }, [user]);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        if (password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await updateUser({ firstname: firstName, lastname: lastName, password: password || undefined });
            setSuccess('Settings updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Failed to update settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start p-8 min-h-[60vh]">
            <Card className="shadow-md dark:bg-gray-850 w-full max-w-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center mb-1">User Settings</CardTitle>
                    <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                        Update your personal information and password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-6 max-w-lg mx-auto"
                        onSubmit={e => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        {success && <div className="text-green-500 text-sm text-center">{success}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="first-name-input" className="block text-sm font-medium">
                                    First Name
                                </label>
                                <Input
                                    id="first-name-input"
                                    type="text"
                                    placeholder="Enter your first name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    autoComplete="given-name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="last-name-input" className="block text-sm font-medium">
                                    Last Name
                                </label>
                                <Input
                                    id="last-name-input"
                                    type="text"
                                    placeholder="Enter your last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    autoComplete="family-name"
                                />
                            </div>
                        </div>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <div className="space-y-2">
                            <label htmlFor="password-input" className="block text-sm font-medium">
                                New Password
                            </label>
                            <Input
                                id="password-input"
                                type="password"
                                placeholder="Enter a new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirm-password-input" className="block text-sm font-medium">
                                Confirm New Password
                            </label>
                            <Input
                                id="confirm-password-input"
                                type="password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;