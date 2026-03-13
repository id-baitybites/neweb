'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, User, Key, Globe, Layout, Save } from 'lucide-react';
import { createTenant } from '@/actions/tenant';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewTenantPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const result = await createTenant(formData);
            if (result.success) {
                toast.success('Tenant created successfully.');
                router.push('/super-admin');
            } else {
                toast.error(result.error || 'Failed to create tenant.');
            }
        } catch (err) {
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '3rem' }}>
                    <Link
                        href="/super-admin"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Enroll New Merchant</h1>
                    <p style={{ color: '#888', marginTop: '0.5rem' }}>Create a new business instance and assign an owner account.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Store Information */}
                    <div style={{ background: '#1a1a1a', borderRadius: '15px', padding: '2rem', border: '1px solid #2a2a2a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'rgba(255, 105, 180, 0.1)', color: '#FF69B4', padding: '0.5rem', borderRadius: '8px' }}>
                                <Building2 size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Store Information</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Store Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="e.g. My Awesome Bakery"
                                    required
                                    style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.8rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Slug (Subdomain)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        name="slug"
                                        type="text"
                                        placeholder="bakery-slug"
                                        required
                                        style={{ width: '100%', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.8rem', color: 'white', paddingRight: '120px', outline: 'none' }}
                                    />
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: '0.85rem' }}>.bitespace.app</span>
                                </div>
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Custom Domain (Optional)</label>
                                <input
                                    name="domain"
                                    type="text"
                                    placeholder="e.g. bakery.com"
                                    style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.8rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Subscription Plan</label>
                                <select 
                                    name="plan"
                                    style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.8rem', color: 'white', outline: 'none' }}
                                >
                                    <option value="FREE">Free Tier</option>
                                    <option value="STARTER">Starter</option>
                                    <option value="PRO">Professional</option>
                                    <option value="ENTERPRISE">Enterprise</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Owner Account */}
                    <div style={{ background: '#1a1a1a', borderRadius: '15px', padding: '2rem', border: '1px solid #2a2a2a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3', padding: '0.5rem', borderRadius: '8px' }}>
                                <User size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Initial Owner Account</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Owner Name</label>
                                <input
                                    name="ownerName"
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.8rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Owner Email</label>
                                <input
                                    name="ownerEmail"
                                    type="email"
                                    placeholder="email@example.com"
                                    required
                                    style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.8rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Owner Password</label>
                                <input
                                    name="ownerPassword"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    required
                                    minLength={8}
                                    style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '0.8rem', color: 'white', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Link
                            href="/super-admin"
                            style={{ padding: '0.8rem 2rem', borderRadius: '10px', color: '#888', fontWeight: 600, textDecoration: 'none' }}
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ 
                                background: '#FF69B4', 
                                color: 'white', 
                                padding: '0.8rem 2.5rem', 
                                borderRadius: '10px', 
                                border: 'none', 
                                fontWeight: 600, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            {isSubmitting ? (
                                'Enrolling...'
                            ) : (
                                <>
                                    <Save size={18} /> Enroll Merchant
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
