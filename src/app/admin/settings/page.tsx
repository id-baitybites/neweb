import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TenantSettingsForm from '@/components/admin/TenantSettingsForm';

export default async function AdminSettingsPage() {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) redirect('/login');

    const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId }
    });

    if (!tenant) return <div>Store not found</div>;

    const parsedTenant = {
        ...tenant,
        theme: typeof tenant.theme === 'string' ? JSON.parse(tenant.theme) : tenant.theme,
        config: typeof tenant.config === 'string' ? JSON.parse(tenant.config) : tenant.config
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Configure Store Personalization</h2>
            <div style={{ maxWidth: '900px' }}>
                <p style={{ marginBottom: '1.5rem', color: '#888' }}>
                    Adjust your branding below. Your storefront will instantly adopt the fonts, colors, and logos that you configure here.
                </p>
                <TenantSettingsForm tenant={parsedTenant} />
            </div>
        </div>
    );
}
