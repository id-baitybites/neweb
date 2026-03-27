'use server';

import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { generateToken } from '@/lib/auth';
import { resolveTenant } from '@/lib/tenant';

const GOOGLE_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_ID);

export async function loginWithGoogle(idToken: string) {
    if (!GOOGLE_ID) {
        return { error: 'Google Login is not configured on this server.' };
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return { error: 'Invalid Google token payload.' };
        }

        const { email, name, picture } = payload;
        const tenant = await resolveTenant();
        const tenantId = tenant?.id || null;

        // Find or create user
        let user: any = await prisma.user.findFirst({
            where: {
                email,
                OR: [
                    { tenantId },
                    { tenantId: null } // Match platform admins too if they use Google
                ]
            },
            include: { profile: true }
        });

        if (!user) {
            // Auto-register new customer
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    image: picture,
                    password: '', // No password for Google users
                    role: 'CUSTOMER',
                    tenantId,
                    profile: {
                        create: {
                            // @ts-ignore
                            preferredPayment: 'QRIS'
                        }
                    }
                },
                include: { profile: true }
            });
        }

        if (!user) throw new Error('User creation failed');

        // Update lastLogin tracking
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Set auth cookie
        const cookieStore = await cookies();
        const token = generateToken({ 
            id: user.id, 
            email: user.email, 
            role: user.role, 
            tenantId: user.tenantId 
        });

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        // Check if profile is complete (needs phone and address at least)
        const isProfileComplete = !!user.profile?.phone && !!user.profile?.addressLine;

        return { 
            success: true, 
            role: user.role,
            needsProfileCompletion: !isProfileComplete
        };

    } catch (error: any) {
        console.error('Google Login Error:', error);
        return { error: 'Gagal verifikasi akun Google.' };
    }
}
