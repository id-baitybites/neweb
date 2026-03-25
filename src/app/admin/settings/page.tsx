import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TenantSettingsForm from '@/components/admin/TenantSettingsForm';
import { getDictionary } from '@/i18n';

export default async function AdminSettingsPage() {
    const user = await getCurrentUser();
    const dict = await getDictionary();
    const { settings: t } = dict.admin;

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
            <h2 style={{ marginBottom: '2rem' }}>{t.title}</h2>
            <div style={{ width: '100%' }}>
                <p style={{ marginBottom: '1.5rem', color: '#888' }}>
                    {t.desc}
                </p>
                <TenantSettingsForm tenant={parsedTenant} adminDict={dict.admin} />
            </div>
        </div>
    );
}
