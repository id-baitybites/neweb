'use client';

import React, { useState } from 'react';
import { updateTenantSettings } from '@/actions/tenant';
import { uploadImageAction } from '@/actions/upload';
import { toast } from 'sonner';
import { Palette, Type, Globe, Truck, Calendar, Save, Upload, Image as ImageIcon, CheckCircle2, Loader2, Instagram, Phone, Mail, MapPin, MessageCircle, QrCode, CreditCard, Info } from 'lucide-react';

export default function TenantSettingsForm({ tenant, adminDict, storeDict }: { tenant: any, adminDict: any, storeDict: any }) {
    const t = adminDict.settings;
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [logoUrl, setLogoUrl] = useState(tenant.logoUrl || '');
    const [theme, setTheme] = useState(tenant.theme);
    const [config, setConfig] = useState(tenant.config);
    const [isHeroUploading, setIsHeroUploading] = useState(false);
    const [isQrisUploading, setIsQrisUploading] = useState(false);

    const THEME_PRESETS = [
        { name: t.preset_indigo || 'Modern Indigo', colors: { primary: '#4F46E5', secondary: '#334155', accent: '#818CF8', background: '#F8FAFC' } },
        { name: t.preset_forest || 'Forest Green', colors: { primary: '#059669', secondary: '#064E3B', accent: '#34D399', background: '#F0FDF4' } },
        { name: t.preset_pink || 'Sweet Pink', colors: { primary: '#DB2777', secondary: '#500724', accent: '#F472B6', background: '#FFF1F2' } },
        { name: t.preset_midnight || 'Midnight', colors: { primary: '#9333EA', secondary: '#0F172A', accent: '#C084FC', background: '#0F172A' } },
        { name: t.preset_coffee || 'Coffee', colors: { primary: '#92400E', secondary: '#451A03', accent: '#D97706', background: '#FFFBEB' } },
    ];

    const CATEGORY_FEES: Record<string, number> = {
        'Regular': 0.7,
        'Micro': 0.3,
        'Non-Profit': 0.0,
        'Education': 0.1,
    };

    const MARGIN = 0.3;

    const calculateTotalFee = (category: string) => {
        const base = CATEGORY_FEES[category] ?? 0.7;
        return (base + MARGIN).toFixed(1);
    };

    const applyPreset = (colors: any) => {
        setTheme({ ...theme, ...colors });
        toast.info(t.toast_preset || 'Preset applied! Check the live preview.');
    };

    // Calculation constants for simulation
    const amount = 100000;
    const catFee = CATEGORY_FEES[config.qris?.category || 'Regular'] ?? 0.7;
    const marginVal = parseFloat(config.qris?.margin || '0.3');
    const totalFeeVal = parseFloat((catFee + marginVal).toFixed(2));
    const calculatedFee = (amount * totalFeeVal) / 100;
    const bearer = config.qris?.feeBearer || 'Merchant';

    let customerPays = amount;
    let netReceived = amount;

    if (bearer === 'Merchant') {
        netReceived = amount - calculatedFee;
        customerPays = amount;
    } else if (bearer === 'Customer') {
        customerPays = amount + calculatedFee;
        netReceived = amount;
    } else if (bearer === 'Split') {
        customerPays = amount + (calculatedFee / 2);
        netReceived = amount - (calculatedFee / 2);
    }

    const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsHeroUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadImageAction(formData, 'backgrounds');
            if (result.success && result.url) {
                setTheme({ ...theme, heroBgUrl: result.url });
                toast.success(t.toast_hero_success || 'Hero background uploaded successfully.');
            } else {
                toast.error(result.error || t.toast_hero_error || 'Failed to upload hero background.');
            }
        } catch (error) {
            toast.error(t.toast_hero_fatal || 'Unexpected error during hero background upload.');
        } finally {
            setIsHeroUploading(false);
        }
    }

    const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsQrisUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadImageAction(formData, 'payments');
            if (result.success && result.url) {
                setConfig({ ...config, qrisUrl: result.url });
                toast.success(t.toast_qris_success || 'QRIS code uploaded successfully.');
            } else {
                toast.error(result.error || t.toast_qris_error || 'Failed to upload QRIS code.');
            }
        } catch (error) {
            toast.error(t.toast_qris_fatal || 'Unexpected error during QRIS upload.');
        } finally {
            setIsQrisUploading(false);
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadImageAction(formData, 'logos');
            if (result.success && result.url) {
                setLogoUrl(result.url);
                toast.success(t.toast_logo_success || 'Logo uploaded successfully.');
            } else {
                toast.error(result.error || t.toast_logo_error || 'Failed to upload logo.');
            }
        } catch (error) {
            toast.error(t.toast_logo_fatal || 'Unexpected error during logo upload.');
        } finally {
            setIsUploading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        formData.append('logoUrl', logoUrl);
        formData.append('theme', JSON.stringify(theme));
        formData.append('config', JSON.stringify(config));

        try {
            const result = await updateTenantSettings(formData);
            if (result.success) {
                toast.success(t.toast_save_success || 'Store settings updated successfully! Page will refresh.');
                setTimeout(() => window.location.reload(), 1500); 
            } else {
                toast.error(result.error || t.toast_save_error);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '2rem', alignItems: 'start' }}>
            <div style={{ flex: '1 1 500px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Visual Identity */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(255, 105, 180, 0.1)', color: '#FF69B4', padding: '0.5rem', borderRadius: '8px' }}>
                            <Palette size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t.visual_identity}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
                        {/* Preset Section */}
                        <div style={{ padding: '1.5rem', background: '#0f0f0f', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                            <label style={{ display: 'block', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#888', fontWeight: 700, letterSpacing: '0.05em' }}>{t.presets}</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {THEME_PRESETS.map((p) => (
                                    <button
                                        key={p.name}
                                        type="button"
                                        onClick={() => applyPreset(p.colors)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            background: '#1a1a1a',
                                            border: '1px solid #2a2a2a',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = '#FF69B4'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                                    >
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '2px 0 0 2px', background: p.colors.primary }} />
                                            <div style={{ width: '12px', height: '12px', background: p.colors.secondary }} />
                                            <div style={{ width: '12px', height: '12px', borderRadius: '0 2px 2px 0', background: p.colors.accent }} />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#eee', fontWeight: 600 }}>{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>{t.logo}</label>
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
                                            <div style={{ fontSize: '0.75rem' }}>{t.no_logo}</div>
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
                                    {isUploading ? <><div className="spinner" /> {t.uploading}</> : <><Upload size={14} /> {t.change_logo}</>}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
                                </label>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                {[
                                    { key: 'primary', label: t.color_primary || 'Primary', desc: t.desc_primary || 'Buttons & links' },
                                    { key: 'secondary', label: t.color_secondary || 'Secondary', desc: t.desc_secondary || 'Nav & Headers' },
                                    { key: 'accent', label: t.color_accent || 'Accent', desc: t.desc_accent || 'UI Highlights' },
                                    { key: 'background', label: t.color_background || 'Background', desc: t.desc_background || 'Main pages' }
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
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{c.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography & Region */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3', padding: '0.5rem', borderRadius: '8px' }}>
                            <Type size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t.typography}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>{t.font}</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>{t.currency}</label>
                            <select
                                name="currency"
                                value={config.currency}
                                onChange={e => setConfig({ ...config, currency: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }}
                            >
                                <option value="IDR">IDR — Rp (Indonesian Rupiah)</option>
                                <option value="USD">USD — $ (US Dollar)</option>
                                <option value="SGD">SGD — S$ (Singapore Dollar)</option>
                                <option value="MYR">MYR — RM (Malaysian Ringgit)</option>
                                <option value="EUR">EUR — € (Euro)</option>
                                <option value="GBP">GBP — £ (British Pound)</option>
                                <option value="JPY">JPY — ¥ (Japanese Yen)</option>
                                <option value="AUD">AUD — A$ (Australian Dollar)</option>
                            </select>
                            <div style={{ fontSize: '0.72rem', color: '#555', marginTop: '0.35rem' }}>{t.currency_hint}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>{t.language}</label>
                            <select name="language" value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }}>
                                <option value="id">{t.lang_id || 'Indonesian (Jakarta)'}</option>
                                <option value="en">{t.lang_en || 'English (US)'}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Hero Section Personalization */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#FF9800', padding: '0.5rem', borderRadius: '8px' }}>
                            <ImageIcon size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t.hero_per}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Language Tab Switcher */}
                            {(() => {
                                const [heroLang, setHeroLang] = React.useState<'id' | 'en'>('id');
                                return (
                                    <div>
                                        {/* Tabs */}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                            {([['id', '🇮🇩 Indonesian'], ['en', '🇬🇧 English']] as const).map(([lang, label]) => (
                                                <button
                                                    key={lang}
                                                    type="button"
                                                    onClick={() => setHeroLang(lang)}
                                                    style={{
                                                        padding: '0.45rem 1rem',
                                                        borderRadius: '8px',
                                                        border: heroLang === lang ? '1px solid #FF69B4' : '1px solid #2a2a2a',
                                                        background: heroLang === lang ? 'rgba(255,105,180,0.12)' : '#0f0f0f',
                                                        color: heroLang === lang ? '#FF69B4' : '#888',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s'
                                                    }}
                                                >{label}</button>
                                            ))}
                                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#555', alignSelf: 'center' }}>
                                                {t.hero_hint}
                                            </span>
                                        </div>

                                        {/* Indonesian fields */}
                                        {heroLang === 'id' && (
                                            <>
                                                <div style={{ marginBottom: '1.25rem' }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                                                        {t.hero_title} — Bahasa Indonesia
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={storeDict.hero_title?.replace('{name}', tenant.name) || "e.g. Delicious Pastry"}
                                                        value={theme.heroTitle || ''}
                                                        onChange={e => setTheme({ ...theme, heroTitle: e.target.value })}
                                                        style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
                                                    />
                                                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.4rem' }}>{t.hero_field_hint}</div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                                                        {t.hero_desc} — Bahasa Indonesia
                                                    </label>
                                                    <textarea
                                                        placeholder={storeDict.hero_desc?.replace('{name}', tenant.name) || "Baked fresh daily..."}
                                                        value={theme.heroDesc || ''}
                                                        onChange={e => setTheme({ ...theme, heroDesc: e.target.value })}
                                                        style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* English fields */}
                                        {heroLang === 'en' && (
                                            <>
                                                <div style={{ marginBottom: '1.25rem' }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                                                        {t.hero_title} — English
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={t.placeholder_title_en || "e.g. Delicious Pastry"}
                                                        value={theme.heroTitle_en || ''}
                                                        onChange={e => setTheme({ ...theme, heroTitle_en: e.target.value })}
                                                        style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
                                                    />
                                                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.4rem' }}>{t.hero_field_hint}</div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                                                        {t.hero_desc} — English
                                                    </label>
                                                    <textarea
                                                        placeholder={t.placeholder_desc_en || "Baked fresh daily..."}
                                                        value={theme.heroDesc_en || ''}
                                                        onChange={e => setTheme({ ...theme, heroDesc_en: e.target.value })}
                                                        style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>


                        <div>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>{t.hero_bg}</label>
                            <div style={{
                                width: '100%',
                                aspectRatio: '16/9',
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
                                {theme.heroBgUrl ? (
                                    <img src={theme.heroBgUrl} alt="Hero Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#444' }}>
                                        <ImageIcon size={30} style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ fontSize: '0.75rem' }}>{t.no_image}</div>
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
                                {isHeroUploading ? <><div className="spinner" /> Uploading...</> : <><Upload size={14} /> Change Image</>}
                                <input type="file" accept="image/*" onChange={handleHeroBgUpload} style={{ display: 'none' }} disabled={isHeroUploading} />
                            </label>
                            {theme.heroBgUrl && (
                                <button type="button" onClick={() => setTheme({ ...theme, heroBgUrl: '' })} style={{ width: '100%', marginTop: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem' }}>
                                    {t.remove_image}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Operations */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '0.5rem', borderRadius: '8px' }}>
                            <Truck size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t.biz_logic}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>{t.delivery_fee} ({config.currency})</label>
                            <input type="number" name="deliveryFee" value={config.deliveryFee} onChange={e => setConfig({ ...config, deliveryFee: Number(e.target.value) })} style={{ width: '100%', padding: '0.8rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#888' }}>{t.preorder}</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                <input type="number" name="minPreOrderDays" value={config.minPreOrderDays} onChange={e => setConfig({ ...config, minPreOrderDays: Number(e.target.value) })} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(233, 30, 99, 0.1)', color: '#E91E63', padding: '0.5rem', borderRadius: '8px' }}>
                                <CreditCard size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t.payment_settings || 'Payment & QRIS Setup'}</h3>
                        </div>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); toast.info('Panduan setup dapat dilihat pada file /docs/QRIS_SETUP_GUIDE.md'); }}
                            style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '6px' }}
                        >
                            <Info size={14} /> Panduan Setup
                        </a>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        
                        {/* 1. Merchant Info */}
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#E91E63', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>1. Merchant Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Merchant Name</label>
                                    <input
                                        type="text"
                                        placeholder="Nama merchant yang muncul di QRIS"
                                        value={config.qris?.merchantName || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, merchantName: e.target.value } })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>NMID</label>
                                    <input
                                        type="text"
                                        placeholder="National Merchant ID (ID10...)"
                                        value={config.qris?.nmid || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, nmid: e.target.value } })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Merchant ID</label>
                                    <input
                                        type="text"
                                        placeholder="ID dari Provider"
                                        value={config.qris?.merchantId || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, merchantId: e.target.value } })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. QRIS Setup */}
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#E91E63', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>2. QRIS & Provider Setup</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>QRIS Provider</label>
                                    <select
                                        value={config.qris?.qrisProvider || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, qrisProvider: e.target.value } })}
                                        style={inputStyle}
                                    >
                                        <option value="">-- Select Provider --</option>
                                        <option value="Midtrans">Midtrans</option>
                                        <option value="Xendit">Xendit</option>
                                        <option value="GoBiz">GoBiz (Gojek/GoPay)</option>
                                        <option value="ShopeePay">ShopeePay</option>
                                        <option value="Other">Other / Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>QRIS Type</label>
                                    <select
                                        value={config.qris?.qrType || 'Static'}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, qrType: e.target.value } })}
                                        style={inputStyle}
                                    >
                                        <option value="Static">Static (Upload Image)</option>
                                        <option value="Dynamic">Dynamic (API Generation)</option>
                                    </select>
                                </div>

                                {config.qris?.qrType !== 'Dynamic' && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>Upload kode QRIS statis Anda jika tidak menggunakan integrasi API dinamis.</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ width: '100px', aspectRatio: '1', background: '#0f0f0f', borderRadius: '8px', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {config.qrisUrl ? <img src={config.qrisUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <QrCode size={30} color="#333" />}
                                            </div>
                                            <label style={{ 
                                                cursor: 'pointer', background: '#2a2a2a', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' 
                                            }}>
                                                {isQrisUploading ? 'Uploading...' : 'Upload QR Image'}
                                                <input type="file" accept="image/*" onChange={handleQrisUpload} style={{ display: 'none' }} />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Fee Configuration */}
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#E91E63', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>3. Fee Configuration</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Merchant Category (MDR Rate)</label>
                                    <select
                                        value={config.qris?.category || 'Regular'}
                                        onChange={e => {
                                            const cat = e.target.value;
                                            const margin = parseFloat(config.qris?.margin || '0.3');
                                            const baseMdr = CATEGORY_FEES[cat] ?? 0.7;
                                            const total = (baseMdr + margin).toFixed(1);
                                            setConfig({ ...config, qris: { ...config.qris, category: cat, feeValue: `${total}%` } });
                                        }}
                                        style={inputStyle}
                                    >
                                        <option value="Regular">Regular (MDR 0.7%)</option>
                                        <option value="Micro">Micro Business / UMI (MDR 0.3%)</option>
                                        <option value="Non-Profit">Social / Non-Profit (MDR 0%)</option>
                                        <option value="Education">Education (MDR 0.1%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Platform Fee (Margin %)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config.qris?.margin || '0.3'}
                                        onChange={e => {
                                            const margin = parseFloat(e.target.value || '0');
                                            const cat = config.qris?.category || 'Regular';
                                            const baseMdr = CATEGORY_FEES[cat] ?? 0.7;
                                            const total = (baseMdr + margin).toFixed(1);
                                            setConfig({ ...config, qris: { ...config.qris, margin: e.target.value, feeValue: `${total}%` } });
                                        }}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Fee Type</label>
                                    <select
                                        value={config.qris?.feeType || 'percentage'}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, feeType: e.target.value } })}
                                        style={inputStyle}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Fee</option>
                                        <option value="hybrid">Hybrid (Flat + %)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Fee Bearer</label>
                                    <select
                                        value={config.qris?.feeBearer || 'Merchant'}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, feeBearer: e.target.value } })}
                                        style={inputStyle}
                                    >
                                        <option value="Merchant">Merchant (Deducted from Sale)</option>
                                        <option value="Customer">Customer (Added to Total)</option>
                                        <option value="Split">Split 50/50</option>
                                    </select>
                                </div>
                            </div>

                            {/* Simulation Box */}
                            <div style={{ background: '#0f0f0f', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FF69B4' }}>🧮 Perhitungan Biaya (Simulasi Rp 100.000)</span>
                                    <div style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                        MDR ({CATEGORY_FEES[config.qris?.category || 'Regular']?.toFixed(1)}%) + Platform ({marginVal.toFixed(1)}%) = <b>{totalFeeVal}%</b>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.25rem' }}>Biaya (Fee)</div>
                                        <div style={{ color: '#ef4444', fontWeight: 700 }}>
                                            Rp {calculatedFee.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.25rem' }}>Pelanggan Bayar</div>
                                        <div style={{ color: 'white', fontWeight: 700 }}>
                                            Rp {customerPays.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.25rem' }}>Net Diterima</div>
                                        <div style={{ color: '#4CAF50', fontWeight: 700 }}>
                                            Rp {netReceived.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid #E91E63' }}>
                                    💡 <b>Impact:</b> Karena ditanggung oleh <b>{config.qris?.feeBearer || 'Merchant'}</b>, maka {config.qris?.feeBearer === 'Merchant' ? 'Margin profit Anda akan terpotong Rp ' + calculatedFee.toLocaleString('id-ID') : config.qris?.feeBearer === 'Customer' ? 'Harga akhir di keranjang akan bertambah Rp ' + calculatedFee.toLocaleString('id-ID') : 'Biaya dibagi rata Rp ' + (calculatedFee / 2).toLocaleString('id-ID') + ' antara Anda & pelanggan'}.
                                </div>
                            </div>
                        </div>

                        {/* 4. API & Integration */}
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#E91E63', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>4. API Configuration & Webhooks</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>API Server Key {config.qris?.qrisProvider ? `(${config.qris?.qrisProvider})` : ''}</label>
                                    <input
                                        type="password"
                                        placeholder="Enter your server/API key"
                                        value={config.qris?.apiKey || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, apiKey: e.target.value } })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Environment</label>
                                    <select
                                        value={config.qris?.environment || 'Sandbox'}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, environment: e.target.value } })}
                                        style={inputStyle}
                                    >
                                        <option value="Sandbox">Sandbox (Testing)</option>
                                        <option value="Production">Production (Live)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Callback Status</label>
                                    <div style={{ ...inputStyle, background: '#0f0f0f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#4CAF50' }}>● Connected</span>
                                        <button type="button" onClick={() => toast.success('Webhook test sent!')} style={{ background: '#222', border: 'none', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Test</button>
                                    </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Callback URL (Webhook)</label>
                                    <div style={{ ...inputStyle, background: '#0f0f0f', color: '#888', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                                        https://dashboard.bitespace.id/api/qris/callback/{tenant.slug}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Contact & Socials */}
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a2a', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(156, 39, 176, 0.1)', color: '#9C27B0', padding: '0.5rem', borderRadius: '8px' }}>
                            <Globe size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{t.contact}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}><Mail size={14} /> {t.email}</label>
                            <input type="email" placeholder="hello@store.com" value={theme.contact?.email || ''} onChange={e => setTheme({ ...theme, contact: { ...theme.contact, email: e.target.value } })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}><Phone size={14} /> {t.phone}</label>
                            <input type="text" placeholder="+62..." value={theme.contact?.phone || ''} onChange={e => setTheme({ ...theme, contact: { ...theme.contact, phone: e.target.value } })} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}><MapPin size={14} /> {t.address}</label>
                            <textarea placeholder="Jl. Raya No. 123..." value={theme.contact?.address || ''} onChange={e => setTheme({ ...theme, contact: { ...theme.contact, address: e.target.value } })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #2a2a2a' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase' }}>{t.social}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <Instagram size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#E1306C' }} />
                                    <input type="text" placeholder="Instagram Username" value={theme.socialLinks?.instagram || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, instagram: e.target.value } })} style={{ ...inputStyle, paddingLeft: '2.5rem' }} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <MessageCircle size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#25D366' }} />
                                    <input type="text" placeholder="WhatsApp Number" value={theme.socialLinks?.whatsapp || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, whatsapp: e.target.value } })} style={{ ...inputStyle, paddingLeft: '2.5rem' }} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, fontSize: '10px', color: 'white', background: '#000', borderRadius: '2px', padding: '1px 3px' }}>TT</div>
                                    <input type="text" placeholder="TikTok Username" value={theme.socialLinks?.tiktok || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, tiktok: e.target.value } })} style={{ ...inputStyle, paddingLeft: '2.5rem' }} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, fontSize: '10px', color: 'white', background: '#1877F2', borderRadius: '2px', padding: '1px 3px' }}>FB</div>
                                    <input type="text" placeholder="Facebook Page" value={theme.socialLinks?.facebook || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, facebook: e.target.value } })} style={{ ...inputStyle, paddingLeft: '2.5rem' }} />
                                </div>
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
                        {isSaving ? <><Loader2 className="animate-spin" size={16} /> {t.saving}</> : <><Save size={20} /> {t.save}</>}
                    </button>
                </div>
            </div>

            {/* LIVE PREVIEW SIDEBAR */}
            <div style={{ flex: '1 1 400px', maxWidth: '512px', position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '15px', border: '1px solid #2a2a2a' }}>
                    <h4 style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t.preview}</h4>

                    <div style={{
                        background: theme.background,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #2a2a2a',
                        fontFamily: theme.font
                    }}>
                        {/* Mock Navbar */}
                        <div style={{ background: theme.secondary, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                            <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                                {logoUrl ? <img src={logoUrl} style={{ height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{tenant.name}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ height: '8px', width: '20px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
                                <div style={{ height: '8px', width: '20px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
                            </div>
                        </div>

                        {/* Mock Hero Component */}
                        <div style={{ padding: '2rem 1.5rem', textAlign: 'center', backgroundImage: theme.heroBgUrl ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${theme.heroBgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: theme.heroBgUrl ? 'white' : 'inherit' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.35rem' }}>
                                {['🇮🇩', '🇬🇧'].map((flag, i) => (
                                    <span key={i} style={{ fontSize: '0.6rem', opacity: 0.6, background: 'rgba(255,255,255,0.15)', padding: '1px 4px', borderRadius: '3px' }}>{flag}</span>
                                ))}
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.heroBgUrl ? 'white' : '#1a1a1a', marginBottom: '0.35rem', lineHeight: 1.2 }}>
                                {config.language === 'en' 
                                    ? (theme.heroTitle_en || theme.heroTitle || storeDict.hero_title?.replace('{name}', tenant.name))
                                    : (theme.heroTitle || storeDict.hero_title?.replace('{name}', tenant.name))}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: theme.heroBgUrl ? 'rgba(255,255,255,0.9)' : '#666', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                                {config.language === 'en' 
                                    ? (theme.heroDesc_en || theme.heroDesc || storeDict.hero_desc?.replace('{name}', tenant.name))
                                    : (theme.heroDesc || storeDict.hero_desc?.replace('{name}', tenant.name))}
                            </div>
                            <div style={{
                                background: theme.primary,
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-block'
                            }}>
                                {storeDict.btn_order}
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
                    <strong>Pro Tip:</strong> {t.pro_tip}
                </div>
            </div>

        </form>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem',
    background: '#0f0f0f',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
}

const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#888',
    marginBottom: '0.6rem',
    fontWeight: 500
}
