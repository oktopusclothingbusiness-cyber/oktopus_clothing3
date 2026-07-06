
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendPromotionalEmail } from '@/lib/mail';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { userId, subject, messageBody } = await request.json();

    if (!subject || !messageBody) {
      return NextResponse.json({ message: 'Subject and message body are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    let recipients: any[] = [];

    if (userId === 'all') {
      // Fetch all users
      recipients = await usersCollection.find({}, { projection: { email: 1 } }).toArray();
    } else if (ObjectId.isValid(userId)) {
      // Fetch a single user
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { email: 1 } });
      if (user) {
        recipients.push(user);
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No valid recipients found.' }, { status: 404 });
    }

    // Sending emails can take time, especially to all users.
    // For a production app, this should be offloaded to a background job queue.
    // For now, we'll send them sequentially.
    for (const recipient of recipients) {
        if(recipient.email) {
            await sendPromotionalEmail({
                to: recipient.email,
                subject: subject,
                messageBody: messageBody,
            });
        }
    }
    
    const message = `Email sent successfully to ${recipients.length} recipient(s).`;
    return NextResponse.json({ message: message }, { status: 200 });

  } catch (error) {
    console.error('Failed to send promotional email(s):', error);
    return NextResponse.json({ message: 'An internal server error occurred while sending emails.' }, { status: 500 });
  }
}
