
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, User } from '@/context/user-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Send } from 'lucide-react';

export default function AdminEmailsPage() {
    const { users, loading: usersLoading } = useUser();
    const { toast } = useToast();
    const [recipient, setRecipient] = React.useState('all'); // 'all' or a user ID
    const [subject, setSubject] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            toast({ title: 'Error', description: 'Subject and message are required.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/emails/send-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: recipient, subject, messageBody: message }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send email(s).');
            }

            toast({
                title: 'Emails Sent!',
                description: data.message,
            });
            // Reset form
            setRecipient('all');
            setSubject('');
            setMessage('');
        } catch (error: any) {
            toast({
                title: 'Error Sending Email',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2"><Mail className="h-8 w-8" /> Send Promotional Emails</h1>
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Compose Your Email</CardTitle>
                    <CardDescription>Send a special offer or announcement to your customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendEmail} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="recipient">Recipient</Label>
                            <Select value={recipient} onValueChange={setRecipient} disabled={usersLoading || isSubmitting}>
                                <SelectTrigger id="recipient">
                                    <SelectValue placeholder="Select a recipient" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users ({users.length})</SelectItem>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., ✨ A Special Offer Just For You!"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your promotional message here. This can include plain text and simple line breaks."
                                required
                                rows={10}
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                            ) : (
                                <><Send className="mr-2 h-4 w-4" /> Send Email</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
