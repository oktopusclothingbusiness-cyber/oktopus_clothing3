
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
import { Loader2, Mail, Send, Paperclip, FileText, X } from 'lucide-react';

interface AttachedFile {
    filename: string;
    content: string; // base64
    size: number;
}

export default function AdminEmailsPage() {
    const { users, loading: usersLoading } = useUser();
    const { toast } = useToast();
    const [recipient, setRecipient] = React.useState('all'); // 'all' or a user ID
    const [emailType, setEmailType] = React.useState<'promotion' | 'update' | 'information' | 'announcement'>('promotion');
    const [subject, setSubject] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [attachedFile, setAttachedFile] = React.useState<AttachedFile | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 5MB for email attachment)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'Attachments must be under 5MB.',
                variant: 'destructive'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            setAttachedFile({
                filename: file.name,
                content: base64String,
                size: file.size,
            });
            toast({
                title: 'Invoice / File Attached',
                description: `${file.name} (${(file.size / 1024).toFixed(1)} KB) ready to attach.`,
            });
        };
        reader.onerror = () => {
            toast({
                title: 'Read Error',
                description: 'Failed to read attached file.',
                variant: 'destructive'
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAttachment = () => {
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            toast({ title: 'Error', description: 'Subject and message are required.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                userId: recipient,
                type: emailType,
                subject,
                messageBody: message,
            };

            if (attachedFile) {
                payload.attachments = [
                    {
                        filename: attachedFile.filename,
                        content: attachedFile.content,
                    }
                ];
            }

            const response = await fetch('/api/emails/send-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
            setEmailType('promotion');
            setSubject('');
            setMessage('');
            setAttachedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2"><Mail className="h-8 w-8" /> Send Branded Emails & Invoices</h1>
            <Card className="max-w-3xl mx-auto shadow-md">
                <CardHeader>
                    <CardTitle>Compose Your Email</CardTitle>
                    <CardDescription>
                        Send official updates, promotional offers, store announcements, or attach customer invoices. Sent from <strong>care@oktopusclothing.in</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendEmail} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label htmlFor="email-type">Email Category</Label>
                                <Select value={emailType} onValueChange={(val: any) => setEmailType(val)} disabled={isSubmitting}>
                                    <SelectTrigger id="email-type">
                                        <SelectValue placeholder="Select email purpose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="promotion">Promotion (Deals & Drops)</SelectItem>
                                        <SelectItem value="update">Store Update (Features & Policies)</SelectItem>
                                        <SelectItem value="information">Official Notice (Information)</SelectItem>
                                        <SelectItem value="announcement">Announcement (Brand News)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Your Oktopus Clothing Order Invoice & Updates"
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
                                placeholder="Write your message here. Line breaks are automatically formatted into neat paragraphs."
                                required
                                rows={8}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Invoice & File Attachment Box */}
                        <div className="space-y-2 pt-2 border-t">
                            <Label className="flex items-center gap-2 text-sm font-semibold">
                                <Paperclip className="h-4 w-4" /> Attach Invoice or Document (PDF / Images)
                            </Label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                id="invoice-attachment-input"
                                className="hidden"
                                accept=".pdf,image/png,image/jpeg,image/webp,.doc,.docx"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />

                            {!attachedFile ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-xs"
                                    disabled={isSubmitting}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="h-4 w-4" />
                                    Choose Invoice / File to Attach
                                </Button>
                            ) : (
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 max-w-md">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText className="h-5 w-5 text-amber-500 shrink-0" />
                                        <div className="truncate">
                                            <p className="text-sm font-medium truncate">{attachedFile.filename}</p>
                                            <p className="text-xs text-muted-foreground">{(attachedFile.size / 1024).toFixed(1)} KB • Ready to send</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={handleRemoveAttachment}
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Attach official invoices (PDF), size guides, or promotional artwork up to 5MB.
                            </p>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                            ) : (
                                <><Send className="mr-2 h-4 w-4" /> Send Email {attachedFile ? 'with Attachment' : ''}</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
