'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function updateTenantSettings(formData: FormData) {
    const user = await getCurrentUser();

    // Only Owners can update setting
    if (!user || user.role !== 'OWNER' || !user.tenantId) {
        return { success: false, error: 'Unauthorized: Only owners can update settings.' };
    }

    const tenantId = user.tenantId;

    try {
        const themeStr = formData.get('theme') as string;
        const configStr = formData.get('config') as string;
        const logoUrl = formData.get('logoUrl') as string;

        // If theme/config are sent as JSON strings (from the new whitelabel form logic)
        // we use them directly to capture all extended properties like hero personalizations.
        let themeUpdate = themeStr ? JSON.parse(themeStr) : {
            primary: formData.get('primary') as string,
            secondary: formData.get('secondary') as string,
            accent: formData.get('accent') as string,
            background: formData.get('background') as string,
            font: formData.get('font') as string
        };

        let configUpdate = configStr ? JSON.parse(configStr) : {
            currency: formData.get('currency') as string,
            timezone: formData.get('timezone') as string,
            language: formData.get('language') as string,
            deliveryFee: parseInt(formData.get('deliveryFee') as string || '0'),
            minPreOrderDays: parseInt(formData.get('minPreOrderDays') as string || '0')
        };

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                logoUrl: logoUrl || null,
                theme: themeUpdate,
                config: configUpdate
            }
        });

        // Clear cache so UI reflects immediately
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Failed to update tenant settings:', error);
        return { success: false, error: error.message };
    }
}

export async function createTenant(formData: FormData) {
    const user = await getCurrentUser();

    // Only Super Admins can create tenants
    if (!user || user.role !== 'SUPER_ADMIN') {
        return { success: false, error: 'Unauthorized: Only super admins can create tenants.' };
    }

    try {
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const domain = formData.get('domain') as string || null;
        const plan = formData.get('plan') as any || 'FREE';
        
        // Owner account details
        const ownerEmail = formData.get('ownerEmail') as string;
        const ownerPassword = formData.get('ownerPassword') as string;
        const ownerName = formData.get('ownerName') as string;

        if (!name || !slug || !ownerEmail || !ownerPassword) {
            return { success: false, error: 'Missing required fields.' };
        }

        // Check if slug exists
        const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
        if (existingTenant) return { success: false, error: 'Slug already taken.' };

        // Create the tenant
        const tenant = await prisma.tenant.create({
            data: {
                name,
                slug,
                domain,
                plan,
            }
        });

        // Create the owner user
        const hashedPassword = await hashPassword(ownerPassword);
        await prisma.user.create({
            data: {
                email: ownerEmail,
                password: hashedPassword,
                name: ownerName,
                role: 'OWNER',
                tenantId: tenant.id
            }
        });

        revalidatePath('/super-admin');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create tenant:', error);
        return { success: false, error: error.message };
    }
}
