
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, profilePictureUrl } = await request.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ message: 'Email, first name, and last name are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    let user = await usersCollection.findOne({ email });

    if (user) {
      // User exists, return their data
      const { password, ...userWithoutPassword } = user;
      return NextResponse.json({ message: 'Login successful.', user: userWithoutPassword }, { status: 200 });
    } else {
      // User does not exist, create a new user
      const newUser = {
        firstName,
        lastName,
        email,
        profilePictureUrl: profilePictureUrl || '',
        role: email === 'rbaskeydomi2018@gmail.com' ? 'admin' : 'user',
        createdAt: new Date(),
      };
      
      const result = await usersCollection.insertOne(newUser);
      const insertedUser = await usersCollection.findOne({ _id: result.insertedId });
      const { password, ...userWithoutPassword } = insertedUser!;

      return NextResponse.json({ message: 'User created and logged in successfully.', user: userWithoutPassword }, { status: 201 });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
