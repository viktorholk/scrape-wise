import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateUser } from '@/services';
import { useUser } from '@/UserContext';
import { User2, KeyRound, CheckCircle2, XCircle } from "lucide-react";

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
        <div className="p-4 md:p-6 flex flex-col items-center min-h-[60vh]">
            <div className="mb-8 flex items-center gap-4">
                <User2 className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">User Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your personal information and password. Changes take effect immediately.
                    </p>
                </div>
            </div>
            <Card className="shadow-md dark:bg-gray-850 w-full max-w-xl">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <User2 className="h-5 w-5 text-primary" />
                        Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                        Update your name and password below.
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
                        {error && (
                            <div className="flex items-center text-red-500 text-sm text-center gap-2 justify-center">
                                <XCircle className="h-4 w-4" /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center text-green-500 text-sm text-center gap-2 justify-center">
                                <CheckCircle2 className="h-4 w-4" /> {success}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="first-name-input" className="block text-sm font-medium flex items-center gap-1">
                                    <User2 className="h-4 w-4 text-muted-foreground" />
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
                                <label htmlFor="last-name-input" className="block text-sm font-medium flex items-center gap-1">
                                    <User2 className="h-4 w-4 text-muted-foreground" />
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
                            <label htmlFor="password-input" className="block text-sm font-medium flex items-center gap-1">
                                <KeyRound className="h-4 w-4 text-muted-foreground" />
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
                            <label htmlFor="confirm-password-input" className="block text-sm font-medium flex items-center gap-1">
                                <KeyRound className="h-4 w-4 text-muted-foreground" />
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