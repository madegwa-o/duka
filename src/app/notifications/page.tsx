'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Send } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function PushNotifications() {
    const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
    const { data: session } = useSession();
    const [title, setTitle] = useState('Test Notification');
    const [body, setBody] = useState('This is a test push notification!');
    const [url, setUrl] = useState('/');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>('');

    if (!session?.user?.id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Authentication Required
                    </h1>
                    <p className="text-gray-600">
                        Please sign in to test push notifications.
                    </p>
                </div>
            </div>
        );
    }


    const handleSendNotification = async () => {
        setLoading(true);
        setResult('');

        try {
            const response = await fetch('/api/push/send-public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, url }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult(`✅ ${data.message}! (Sent: ${data.sent}, Failed: ${data.failed}).`);
            } else {
                setResult(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Push Notifications Not Supported
                    </h1>
                    <p className="text-gray-600">
                        Your browser doesn&apos;t support push notifications. Please try using a modern browser like Chrome, Firefox, or Edge.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto space-y-6 py-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Test Push Notifications
                    </h1>

                    {/* User Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            Logged in as: <span className="font-semibold">{session.user.email}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            User ID: {session.user.id}
                        </p>
                    </div>

                    {/* Subscription Status */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-800">
                                    Subscription Status
                                </p>
                                <p className="text-sm text-gray-600">
                                    {isSubscribed ? 'Subscribed to push notifications' : 'Not subscribed'}
                                </p>
                            </div>
                            <Button
                                onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                                variant={isSubscribed ? 'outline' : 'default'}
                            >
                                {isSubscribed ? (
                                    <>
                                        <BellOff className="h-4 w-4 mr-2" />
                                        Unsubscribe
                                    </>
                                ) : (
                                    <>
                                        <Bell className="h-4 w-4 mr-2" />
                                        Subscribe
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>


                    {/* Custom Notification Form */}
                    <div className="border-t pt-6 space-y-4">
                        <h3 className="font-semibold text-gray-800 mb-4">
                            Send Custom Notification
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notification Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Enter notification title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notification Body
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                placeholder="Enter notification message"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target URL (optional)
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="/"
                            />
                        </div>

                        <Button
                            onClick={handleSendNotification}
                            disabled={loading || !title || !body}
                            className="w-full"
                            variant="secondary"
                        >
                            {loading ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Custom Notification (All Users)
                                </>
                            )}
                        </Button>

                        {result && (
                            <div className={`p-4 rounded-lg ${
                                result.startsWith('✅')
                                    ? 'bg-green-50 text-green-800'
                                    : 'bg-red-50 text-red-800'
                            }`}>
                                {result}
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Instructions:
                        </h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                            <li>Click &quot;Subscribe&quot; to enable push notifications</li>
                            <li>Allow notifications when prompted by your browser</li>
                            <li>Click &quot;Send Quick Test Notification&quot; to test</li>
                            <li>Or customize your notification using the form above</li>
                            <li>You should receive a push notification!</li>
                        </ol>
                        <p className="text-xs text-gray-600 mt-3">
                            Note: The quick test sends to you only, while custom notifications send to all subscribed users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}