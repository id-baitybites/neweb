'use client';

import React, { useState } from 'react';
import { updateTenantSettings } from '@/actions/tenant';
import { uploadImageAction } from '@/actions/upload';
import { toast } from 'sonner';

export default function TenantSettingsForm({ tenant }: { tenant: any }) {
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [logoUrl, setLogoUrl] = useState(tenant.logoUrl || '');
    const [theme, setTheme] = useState(tenant.theme);
    const [config, setConfig] = useState(tenant.config);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            const result = await uploadImageAction(base64data, 'logos');

            if (result.success && result.url) {
                setLogoUrl(result.url);
                toast.success('Logo uploaded successfully.');
            } else {
                toast.error(result.error || 'Failed to upload logo.');
            }
            setIsUploading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        formData.append('logoUrl', logoUrl);

        try {
            const result = await updateTenantSettings(formData);
            if (result.success) {
                toast.success('Store settings updated successfully! Page will refresh.');
                setTimeout(() => window.location.reload(), 1500); // Reload to apply CSS vars perfectly
            } else {
                toast.error(result.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', color: 'white', maxWidth: '800px', border: '1px solid #333' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>Store Personalization</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <h4 style={{ marginBottom: '1rem', color: '#888' }}>Store Logo</h4>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        background: '#222',
                        borderRadius: '10px',
                        border: '2px dashed #444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        overflow: 'hidden'
                    }}>
                        {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#555' }}>No Logo</span>}
                    </div>
                    <label style={{ cursor: 'pointer', background: '#333', padding: '0.5rem 1rem', borderRadius: '5px', fontSize: '0.9rem', display: 'inline-block' }}>
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
                    </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#888' }}>Brand Colors</h4>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input type="color" name="primary" value={theme.primary} onChange={e => setTheme({ ...theme, primary: e.target.value })} style={{ width: 40, height: 40, padding: 0, border: 'none', background: 'transparent' }} />
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Primary Color</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Main brand color for buttons</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input type="color" name="secondary" value={theme.secondary} onChange={e => setTheme({ ...theme, secondary: e.target.value })} style={{ width: 40, height: 40, padding: 0, border: 'none', background: 'transparent' }} />
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Secondary Color</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input type="color" name="accent" value={theme.accent} onChange={e => setTheme({ ...theme, accent: e.target.value })} style={{ width: 40, height: 40, padding: 0, border: 'none', background: 'transparent' }} />
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Accent Color</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input type="color" name="background" value={theme.background} onChange={e => setTheme({ ...theme, background: e.target.value })} style={{ width: 40, height: 40, padding: 0, border: 'none', background: 'transparent' }} />
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Background Color</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Primary Font Family</label>
                    <select name="font" value={theme.font} onChange={e => setTheme({ ...theme, font: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }}>
                        <option value="Inter">Inter (Default)</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="DM Sans">DM Sans</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Lora">Lora</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Currency</label>
                    <input type="text" name="currency" value={config.currency} onChange={e => setConfig({ ...config, currency: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Language</label>
                    <select name="language" value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }}>
                        <option value="id">Indonesian (ID)</option>
                        <option value="en">English (EN)</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Timezone</label>
                    <select name="timezone" value={config.timezone} onChange={e => setConfig({ ...config, timezone: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }}>
                        <option value="Asia/Jakarta">WIB (Jakarta)</option>
                        <option value="Asia/Makassar">WITA (Makassar)</option>
                        <option value="Asia/Jayapura">WIT (Jayapura)</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Delivery Fee (Num)</label>
                    <input type="number" name="deliveryFee" value={config.deliveryFee} onChange={e => setConfig({ ...config, deliveryFee: Number(e.target.value) })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Min Pre-Order Days</label>
                    <input type="number" name="minPreOrderDays" value={config.minPreOrderDays} onChange={e => setConfig({ ...config, minPreOrderDays: Number(e.target.value) })} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                <button type="submit" disabled={isSaving || isUploading} style={{ background: '#FF69B4', color: 'white', padding: '0.8rem 2rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: (isSaving || isUploading) ? 'not-allowed' : 'pointer', opacity: (isSaving || isUploading) ? 0.7 : 1 }}>
                    {isSaving ? 'Saving...' : 'Save Personalization'}
                </button>
            </div>
        </form>
    );
}
