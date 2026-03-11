'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth';
import { revalidatePath } from 'next/cache';

export async function updateTenantSettings(formData: FormData) {
    const user = await getCurrentUser();

    // Only Owners can update setting
    if (!user || user.role !== 'OWNER' || !user.tenantId) {
        return { success: false, error: 'Unauthorized: Only owners can update settings.' };
    }

    const tenantId = user.tenantId;

    try {
        const primary = formData.get('primary') as string;
        const secondary = formData.get('secondary') as string;
        const accent = formData.get('accent') as string;
        const background = formData.get('background') as string;
        const font = formData.get('font') as string;
        const logoUrl = formData.get('logoUrl') as string;

        const currency = formData.get('currency') as string;
        const timezone = formData.get('timezone') as string;
        const language = formData.get('language') as string;
        const deliveryFee = parseInt(formData.get('deliveryFee') as string);
        const minPreOrderDays = parseInt(formData.get('minPreOrderDays') as string);

        const themeUpdate = {
            primary,
            secondary,
            accent,
            background,
            font
        };

        const configUpdate = {
            currency,
            timezone,
            language,
            deliveryFee,
            minPreOrderDays
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
