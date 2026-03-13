'use client';

import React, { useState } from 'react';
import { updateTenantSettings } from '@/actions/tenant';
import { uploadImageAction } from '@/actions/upload';
import { toast } from 'sonner';
import { Palette, Type, Globe, Truck, Calendar, Save, Upload, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';

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
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Visual Identity */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(255, 105, 180, 0.1)', color: '#FF69B4', padding: '0.5rem', borderRadius: '8px' }}>
                            <Palette size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Visual Identity & Colors</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '3rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>STORE LOGO</label>
                            <div style={{
                                width: '100%',
                                aspectRatio: '1',
                                background: '#0f0f0f',
                                borderRadius: '12px',
                                border: '2px dashed #2a2a2a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#444' }}>
                                        <ImageIcon size={40} style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ fontSize: '0.75rem' }}>No logo</div>
                                    </div>
                                )}
                            </div>
                            <label style={{ 
                                cursor: 'pointer', 
                                background: '#2a2a2a', 
                                color: 'white',
                                padding: '0.6rem 1rem', 
                                borderRadius: '8px', 
                                fontSize: '0.85rem', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'background 0.2s'
                            }}>
                                {isUploading ? <><div className="spinner" /> Uploading...</> : <><Upload size={14} /> Change Logo</>}
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
                            </label>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>BRAND COLOR PALETTE</label>
                            
                            {[
                                { key: 'primary', label: 'Primary', desc: 'Main buttons and active states' },
                                { key: 'secondary', label: 'Secondary', desc: 'Headers and sidebar navigation' },
                                { key: 'accent', label: 'Accent', desc: 'Badges and secondary highlights' },
                                { key: 'background', label: 'Background', desc: 'Main page body background' }
                            ].map((c) => (
                                <div key={c.key} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#0f0f0f', padding: '0.75rem', borderRadius: '10px', border: '1px solid #2a2a2a' }}>
                                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                                        <input 
                                            type="color" 
                                            name={c.key} 
                                            value={theme[c.key]} 
                                            onChange={e => setTheme({ ...theme, [c.key]: e.target.value })} 
                                            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} 
                                        />
                                        <div style={{ width: '100%', height: '100%', borderRadius: '6px', backgroundColor: theme[c.key], border: '2px solid #2a2a2a' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{c.desc}</div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#888' }}>{theme[c.key].toUpperCase()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Typography & Region */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3', padding: '0.5rem', borderRadius: '8px' }}>
                            <Type size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Typography & Localization</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>Global Font Family</label>
                            <select 
                                name="font" 
                                value={theme.font} 
                                onChange={e => setTheme({ ...theme, font: e.target.value })} 
                                style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white', fontSize: '1rem', fontFamily: theme.font }}
                            >
                                {['Inter', 'Roboto', 'Poppins', 'DM Sans', 'Playfair Display', 'Lora', 'Montserrat', 'Open Sans'].map(f => (
                                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>Currency</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                <input type="text" name="currency" value={config.currency} onChange={e => setConfig({ ...config, currency: e.target.value })} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>Default Language</label>
                            <select name="language" value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }}>
                                <option value="id">Indonesian (Jakarta)</option>
                                <option value="en">English (US)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Operations */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '0.5rem', borderRadius: '8px' }}>
                            <Truck size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Business Logic</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>Delivery Fee ({config.currency})</label>
                            <input type="number" name="deliveryFee" value={config.deliveryFee} onChange={e => setConfig({ ...config, deliveryFee: Number(e.target.value) })} style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>Minimum Pre-Order Days</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                <input type="number" name="minPreOrderDays" value={config.minPreOrderDays} onChange={e => setConfig({ ...config, minPreOrderDays: Number(e.target.value) })} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button 
                        type="submit" 
                        disabled={isSaving || isUploading} 
                        style={{ 
                            background: theme.primary, 
                            color: 'white', 
                            padding: '1rem 3rem', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontWeight: 700, 
                            fontSize: '1rem',
                            cursor: (isSaving || isUploading) ? 'not-allowed' : 'pointer', 
                            opacity: (isSaving || isUploading) ? 0.7 : 1,
                            boxShadow: `0 8px 20px ${theme.primary}44`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={e => !isSaving && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        {isSaving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Save size={20} /> Update Branding</>}
                    </button>
                </div>
            </div>

            {/* LIVE PREVIEW SIDEBAR */}
            <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Storefront Preview</h4>
                    
                    <div style={{ 
                        background: theme.background, 
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        border: '1px solid #2a2a2a',
                        fontFamily: theme.font
                    }}>
                        {/* Mock Navbar */}
                        <div style={{ background: theme.secondary, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ height: '20px', width: '60px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)' }}>
                                {logoUrl && <img src={logoUrl} style={{ height: '100%', objectFit: 'contain' }} />}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ height: '8px', width: '20px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
                                <div style={{ height: '8px', width: '20px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
                            </div>
                        </div>

                        {/* Mock Hero Component */}
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem', lineHeight: 1.2 }}>Delicious Pastry Just For You</div>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '1rem' }}>Baked fresh everyday with only premium ingredients.</div>
                            <div style={{ 
                                background: theme.primary, 
                                color: 'white', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                display: 'inline-block'
                            }}>
                                Order Now
                            </div>
                        </div>

                        {/* Mock Badge */}
                        <div style={{ background: '#f8f9fa', padding: '1rem', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: theme.accent }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ height: '6px', width: '60px', borderRadius: '3px', background: '#ddd', marginBottom: '4px' }} />
                                <div style={{ height: '4px', width: '40px', borderRadius: '2px', background: '#eee' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4CAF50', fontSize: '0.8rem' }}>
                        <CheckCircle2 size={14} />
                        <span>Live preview updating...</span>
                    </div>
                </div>

                <div style={{ background: 'rgba(255, 105, 180, 0.05)', padding: '1.25rem', borderRadius: '15px', border: '1px dashed rgba(255, 105, 180, 0.2)', color: '#FF69B4', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <strong>Pro Tip:</strong> Use high-contrast colors for your Primary and Secondary choices to ensure your text remains legible and professional.
                </div>
            </div>

        </form>
    );
}
