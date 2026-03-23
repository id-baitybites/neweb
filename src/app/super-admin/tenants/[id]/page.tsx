import React from 'react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { redirect, notFound } from 'next/navigation'
import TenantManageClient from "@/components/admin/TenantManageClient";
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ManageTenantPageProps {
    params: Promise<{ id: string }>
}

export default async function ManageTenantPage({ params }: ManageTenantPageProps) {
    const { id } = await params
    const user = await getCurrentUser()
    
    // Safety check: Only SUPER_ADMIN allowed
    if (!user || user.role !== 'SUPER_ADMIN') {
        redirect('/')
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    products: true,
                    orders: true,
                    users: true
                }
            }
        }
    })

    if (!tenant) {
        notFound()
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <Link 
                        href="/super-admin" 
                        style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={16} /> Kembali ke Dashboard
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ 
                            width: 64, height: 64, borderRadius: '16px', 
                            background: '#1a1a1a', border: '1px solid #2a2a2a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 800, color: '#FF69B4'
                        }}>
                            {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>{tenant.name}</h1>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <span style={{ color: '#FF69B4', fontFamily: 'monospace' }}>/{tenant.slug}</span>
                                <span style={{ color: '#555' }}>•</span>
                                <span style={{ color: tenant.isActive ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
                                    {tenant.isActive ? 'AKTIF' : 'SUSPENDED'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <TenantManageClient tenant={tenant} />
            </div>
        </div>
    )
}
