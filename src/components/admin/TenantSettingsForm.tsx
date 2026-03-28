'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateTenantSettings } from '@/actions/tenant';
import { uploadImageAction } from '@/actions/upload';
import { toast } from 'sonner';
import { 
    Palette, Type, Globe, Save, Upload, Image as ImageIcon, 
    Loader2, Instagram, Phone, Mail, MapPin, MessageCircle, 
    Truck, Calendar, CreditCard, Info, QrCode, CheckCircle2, HelpCircle 
} from 'lucide-react';
import { TenantData } from '@/lib/tenant';
import styles from '@/styles/modules/AdminSettings.module.scss';

interface TenantProps {
    tenant: TenantData;
    adminDict: any;
    storeDict: any;
}

const THEME_PRESETS_DATA = (t: any) => [
    { name: t.preset_indigo || 'Modern Indigo', colors: { primary: '#4F46E5', secondary: '#334155', accent: '#818CF8', background: '#F8FAFC' } },
    { name: t.preset_forest || 'Forest Green', colors: { primary: '#059669', secondary: '#064E3B', accent: '#34D399', background: '#F0FDF4' } },
    { name: t.preset_pink || 'Sweet Pink', colors: { primary: '#DB2777', secondary: '#500724', accent: '#F472B6', background: '#FFF1F2' } },
    { name: t.preset_midnight || 'Midnight', colors: { primary: '#9333EA', secondary: '#0F172A', accent: '#C084FC', background: '#0F172A' } },
    { name: t.preset_coffee || 'Coffee', colors: { primary: '#92400E', secondary: '#451A03', accent: '#D97706', background: '#FFFBEB' } },
];

export const CATEGORY_FEES: Record<string, number> = {
    'Regular': 0.7,
    'Micro': 0.3,
    'Non-Profit': 0.0,
    'Education': 0.1,
};

const SIMULATION_BASE_AMOUNT = 100000;

export default function TenantSettingsForm({ tenant, adminDict, storeDict }: TenantProps) {
    const router = useRouter();
    const t = adminDict.settings;
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [logoUrl, setLogoUrl] = useState(tenant.logoUrl || '');
    const [theme, setTheme] = useState(tenant.theme);
    const [config, setConfig] = useState(tenant.config);
    const [isHeroUploading, setIsHeroUploading] = useState(false);
    const [isQrisUploading, setIsQrisUploading] = useState(false);
    const [heroLang, setHeroLang] = useState<'id' | 'en'>('id');

    const THEME_PRESETS = useMemo(() => THEME_PRESETS_DATA(t), [t]);

    const simulation = useMemo(() => {
        const catFee = CATEGORY_FEES[config.qris?.category || 'Regular'] ?? 0.7;
        const marginVal = parseFloat(config.qris?.margin || '0.3');
        const totalFeeVal = parseFloat((catFee + marginVal).toFixed(2));
        const calculatedFee = (SIMULATION_BASE_AMOUNT * totalFeeVal) / 100;
        const bearer = config.qris?.feeBearer || 'Merchant';

        let customerPays = SIMULATION_BASE_AMOUNT;
        let netReceived = SIMULATION_BASE_AMOUNT;

        if (bearer === 'Merchant') {
            netReceived = SIMULATION_BASE_AMOUNT - calculatedFee;
            customerPays = SIMULATION_BASE_AMOUNT;
        } else if (bearer === 'Customer') {
            customerPays = SIMULATION_BASE_AMOUNT + calculatedFee;
            netReceived = SIMULATION_BASE_AMOUNT;
        } else if (bearer === 'Split') {
            customerPays = SIMULATION_BASE_AMOUNT + (calculatedFee / 2);
            netReceived = SIMULATION_BASE_AMOUNT - (calculatedFee / 2);
        }

        return { calculatedFee, customerPays, netReceived, totalFeeVal, marginVal };
    }, [config.qris?.category, config.qris?.margin, config.qris?.feeBearer]);

    const { calculatedFee, customerPays, netReceived, totalFeeVal, marginVal } = simulation;

    const applyPreset = (colors: any) => {
        setTheme({ ...theme, ...colors });
        toast.info(t.toast_preset || 'Preset applied! Check the live preview.');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'backgrounds' | 'payments' | 'logos') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const setLoader = type === 'backgrounds' ? setIsHeroUploading : type === 'payments' ? setIsQrisUploading : setIsUploading;
        setLoader(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadImageAction(formData, type);
            if (result.success && result.url) {
                if (type === 'backgrounds') setTheme({ ...theme, heroBgUrl: result.url });
                else if (type === 'payments') setConfig({ ...config, qrisUrl: result.url });
                else setLogoUrl(result.url);
                toast.success(t[`toast_${type.slice(0, -1)}_success`] || 'Upload successful.');
            } else {
                toast.error(result.error || t[`toast_${type.slice(0, -1)}_error`] || 'Upload failed.');
            }
        } catch (error) {
            toast.error('Unexpected error during upload.');
        } finally {
            setLoader(false);
        }
    };

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
                toast.success(t.toast_save_success);
                router.refresh(); 
                setTimeout(() => window.location.reload(), 2000); 
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
        <form 
            onSubmit={handleSubmit} 
            className={styles.settingsForm}
            style={{
                '--primary-color': theme.primary,
                '--secondary-color': theme.secondary,
                '--accent-color': theme.accent,
                '--bg-color': theme.background,
                '--font-family': theme.font,
                '--hero-text-color': theme.heroBgUrl ? 'white' : 'inherit'
            } as React.CSSProperties}
        >
            <div className={styles.leftColumn}>
                {/* Visual Identity */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.visual}`}>
                                <Palette size={20} />
                            </div>
                            <h3>{t.visual_identity}</h3>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        {/* Preset Section */}
                        <div className={styles.presetContainer}>
                            <label>{t.presets}</label>
                            <div className={styles.presetGrid}>
                                {THEME_PRESETS.map((p) => (
                                    <button
                                        key={p.name}
                                        type="button"
                                        onClick={() => applyPreset(p.colors)}
                                        className={styles.presetButton}
                                    >
                                        <div className={styles.swatch}>
                                            <div style={{ background: p.colors.primary }} />
                                            <div style={{ background: p.colors.secondary }} />
                                            <div style={{ background: p.colors.accent }} />
                                        </div>
                                        <span>{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.inputGrid}>
                            <div>
                                <label className={styles.label}>{t.logo}</label>
                                <div className={styles.uploadBox}>
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" />
                                    ) : (
                                        <div className={styles.placeholder}>
                                            <ImageIcon size={40} style={{ marginBottom: '0.5rem' }} />
                                            <div>{t.no_logo}</div>
                                        </div>
                                    )}
                                </div>
                                <label className={styles.uploadLabel}>
                                    {isUploading ? <><div className="spinner" /> {t.uploading}</> : <><Upload size={14} /> {t.change_logo}</>}
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logos')} disabled={isUploading} />
                                </label>
                            </div>

                            <div className={`${styles.inputGrid} ${styles.autoFit}`}>
                                {[
                                    { key: 'primary', label: t.color_primary || 'Primary', desc: t.desc_primary || 'Buttons & links' },
                                    { key: 'secondary', label: t.color_secondary || 'Secondary', desc: t.desc_secondary || 'Nav & Headers' },
                                    { key: 'accent', label: t.color_accent || 'Accent', desc: t.desc_accent || 'UI Highlights' },
                                    { key: 'background', label: t.color_background || 'Background', desc: t.desc_background || 'Main pages' }
                                ].map((c) => (
                                    <div key={c.key} className={styles.colorPickerBox}>
                                        <div className={styles.picker}>
                                            <input
                                                type="color"
                                                name={c.key}
                                                value={theme[c.key]}
                                                onChange={e => setTheme({ ...theme, [c.key]: e.target.value })}
                                            />
                                            <div className={styles.preview} style={{ backgroundColor: theme[c.key] }} />
                                        </div>
                                        <div className={styles.info}>
                                            <div>{c.label}</div>
                                            <div>{c.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography & Region */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.typography}`}>
                                <Type size={20} />
                            </div>
                            <h3>{t.typography}</h3>
                        </div>
                    </div>

                    <div className={`${styles.inputGrid} ${styles.twoCol}`}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className={styles.label}>{t.font}</label>
                            <select
                                name="font"
                                className={styles.select}
                                value={theme.font}
                                onChange={e => setTheme({ ...theme, font: e.target.value })}
                                style={{ fontFamily: theme.font }}
                            >
                                {['Inter', 'Roboto', 'Poppins', 'DM Sans', 'Playfair Display', 'Lora', 'Montserrat', 'Open Sans'].map(f => (
                                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={styles.label}>{t.currency}</label>
                            <select
                                name="currency"
                                className={styles.select}
                                value={config.currency}
                                onChange={e => setConfig({ ...config, currency: e.target.value })}
                            >
                                <option value="IDR">IDR — Rp (Indonesian Rupiah)</option>
                                <option value="USD">USD — $ (US Dollar)</option>
                                <option value="SGD">SGD — S$ (Singapore Dollar)</option>
                            </select>
                            <div className={styles.inputSubHint}>{t.currency_hint}</div>
                        </div>

                        <div>
                            <label className={styles.label}>{t.language}</label>
                            <select 
                                name="language" 
                                className={styles.select}
                                value={config.language} 
                                onChange={e => setConfig({ ...config, language: e.target.value })}
                            >
                                <option value="id">{t.lang_id || 'Indonesian'}</option>
                                <option value="en">{t.lang_en || 'English'}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Hero Section Personalization */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.hero}`}>
                                <ImageIcon size={20} />
                            </div>
                            <h3>{t.hero_per}</h3>
                        </div>
                    </div>

                    <div className={styles.inputGrid}>
                        <div className={styles.fieldGroup}>
                            <div className={styles.langTabs}>
                                {([['id', '🇮🇩 Indonesian'], ['en', '🇬🇧 English']] as const).map(([lang, label]) => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setHeroLang(lang)}
                                        className={`${styles.tabBtn} ${heroLang === lang ? styles.active : ''}`}
                                    >{label}</button>
                                ))}
                                <span className={styles.hint}>{t.hero_hint}</span>
                            </div>

                            {heroLang === 'id' ? (
                                <>
                                    <div>
                                        <label className={styles.label}>{t.hero_title} — ID</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={theme.heroTitle || ''}
                                            onChange={e => setTheme({ ...theme, heroTitle: e.target.value })}
                                        />
                                        <div className={styles.inputSubHint}>{t.hero_field_hint}</div>
                                    </div>
                                    <div>
                                        <label className={styles.label}>{t.hero_desc} — ID</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={theme.heroDesc || ''}
                                            onChange={e => setTheme({ ...theme, heroDesc: e.target.value })}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className={styles.label}>{t.hero_title} — EN</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={theme.heroTitle_en || ''}
                                            onChange={e => setTheme({ ...theme, heroTitle_en: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label}>{t.hero_desc} — EN</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={theme.heroDesc_en || ''}
                                            onChange={e => setTheme({ ...theme, heroDesc_en: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <label className={styles.label}>{t.hero_bg}</label>
                            <div className={`${styles.uploadBox} ${styles.hero}`}>
                                {theme.heroBgUrl ? (
                                    <img src={theme.heroBgUrl} alt="Hero" className={styles.cover} />
                                ) : (
                                    <div className={styles.placeholder}>
                                        <ImageIcon size={30} />
                                        <div>{t.no_image}</div>
                                    </div>
                                )}
                            </div>
                            <label className={styles.uploadLabel}>
                                {isHeroUploading ? 'Uploading...' : 'Change Image'}
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'backgrounds')} />
                            </label>
                            {theme.heroBgUrl && (
                                <button type="button" className={styles.removeBtn} onClick={() => setTheme({ ...theme, heroBgUrl: '' })}>
                                    {t.remove_image}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Operations */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.ops}`}>
                                <Truck size={20} />
                            </div>
                            <h3>{t.biz_logic}</h3>
                        </div>
                    </div>

                    <div className={styles.inputGrid}>
                        <div>
                            <label className={styles.label}>{t.delivery_fee} ({config.currency})</label>
                            <input 
                                type="number" 
                                className={styles.input}
                                value={config.deliveryFee} 
                                onChange={e => setConfig({ ...config, deliveryFee: Number(e.target.value) })} 
                            />
                        </div>
                        <div>
                            <label className={styles.label}>{t.preorder}</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                <input 
                                    type="number" 
                                    className={styles.input}
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={config.minPreOrderDays} 
                                    onChange={e => setConfig({ ...config, minPreOrderDays: Number(e.target.value) })} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pages & Support Content */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.pages}`}>
                                <Info size={20} />
                            </div>
                            <h3>Pages & Support Content</h3>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div>
                            <label className={styles.label}>About Us — Our Story (Indonesian)</label>
                            <textarea
                                className={`${styles.textarea} large`}
                                placeholder={storeDict.story_desc}
                                value={theme.aboutStory || ''}
                                onChange={e => setTheme({ ...theme, aboutStory: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={styles.label}>About Us — Our Mission (Indonesian)</label>
                            <textarea
                                className={styles.textarea}
                                placeholder={storeDict.mission_desc}
                                value={theme.aboutMission || ''}
                                onChange={e => setTheme({ ...theme, aboutMission: e.target.value })}
                            />
                        </div>

                        <div className={styles.faqBox}>
                            <div className={styles.faqHeader}>
                                <HelpCircle size={18} color="#4f46e5" />
                                <h4>Quick FAQ Setup</h4>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div>
                                    <label className={styles.label}>FAQ Question 1</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={theme.faq1_q || ''}
                                        onChange={e => setTheme({ ...theme, faq1_q: e.target.value })}
                                    />
                                    <label className={styles.label} style={{ marginTop: '0.5rem' }}>FAQ Answer 1</label>
                                    <textarea
                                        className={styles.textarea}
                                        value={theme.faq1_a || ''}
                                        onChange={e => setTheme({ ...theme, faq1_a: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.payment}`}>
                                <CreditCard size={20} />
                            </div>
                            <h3>{t.payment_settings || 'Payment & QRIS Setup'}</h3>
                        </div>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); toast.info('Panduan setup dapat dilihat pada file /docs/QRIS_SETUP_GUIDE.md'); }}
                            className={styles.guideLink}
                        >
                            <Info size={14} /> Panduan Setup
                        </a>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#E91E63', textTransform: 'uppercase', marginBottom: '1.25rem' }}>1. Merchant Information</h4>
                            <div className={`${styles.inputGrid} ${styles.twoCol}`}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Merchant Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={config.qris?.merchantName || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, merchantName: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>NMID</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={config.qris?.nmid || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, nmid: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Merchant ID</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={config.qris?.merchantId || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, merchantId: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#E91E63', textTransform: 'uppercase', marginBottom: '1.25rem' }}>2. QRIS & Provider Setup</h4>
                            <div className={styles.inputGrid}>
                                <div>
                                    <label className={styles.label}>QRIS Provider</label>
                                    <select
                                        className={styles.select}
                                        value={config.qris?.qrisProvider || ''}
                                        onChange={e => setConfig({ ...config, qris: { ...config.qris, qrisProvider: e.target.value } })}
                                    >
                                        <option value="">-- Select Provider --</option>
                                        <option value="Midtrans">Midtrans</option>
                                        <option value="Xendit">Xendit</option>
                                        <option value="GoBiz">GoBiz</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>Upload static QRIS code if not using API integration.</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div className={`${styles.uploadBox} ${styles.qris}`}>
                                            {config.qrisUrl ? <img src={config.qrisUrl} /> : <QrCode size={30} color="#333" />}
                                        </div>
                                        <label className={styles.uploadLabel}>
                                            {isQrisUploading ? 'Uploading...' : 'Upload QR Image'}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'payments')} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#E91E63', textTransform: 'uppercase', marginBottom: '1.25rem' }}>3. Fee & Payouts</h4>
                            <div className={styles.simulationBox}>
                                <div className={styles.simHeader}>
                                    <span>🧮 Perhitungan Biaya (Simulasi Rp 100.000)</span>
                                    <div className={styles.mdrTag}>MDR {totalFeeVal}%</div>
                                </div>
                                <div className={styles.simGrid}>
                                    <div>
                                        <div className={styles.label}>Fee</div>
                                        <div className={`${styles.val} ${styles.red}`}>Rp {calculatedFee.toLocaleString('id-ID')}</div>
                                    </div>
                                    <div>
                                        <div className={styles.label}>Customer Pays</div>
                                        <div className={styles.val}>Rp {customerPays.toLocaleString('id-ID')}</div>
                                    </div>
                                    <div>
                                        <div className={styles.label}>Net Received</div>
                                        <div className={`${styles.val} ${styles.green}`}>Rp {netReceived.toLocaleString('id-ID')}</div>
                                    </div>
                                </div>
                                <div className={styles.simFooter}>
                                    💡 <b>Impact:</b> Karena ditanggung oleh <b>{config.qris?.feeBearer || 'Merchant'}</b>...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping & Biteship */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.business}`}>
                                <Truck size={20} />
                            </div>
                            <h3>Shipping & Delivery Integration</h3>
                        </div>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}>Configure your Biteship API credentials and warehouse origin.</p>
                    </div>

                    <div className={styles.settingsGrid}>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '1.25rem' }}>1. Biteship Credentials</h4>
                            <div className={`${styles.inputGrid} ${styles.twoCol}`}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Biteship API Key <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input 
                                        type="text" 
                                        className={styles.input} 
                                        placeholder="biteship_..." 
                                        value={config.biteship?.apiKey || ''} 
                                        onChange={e => setConfig({ ...config, biteship: { ...config.biteship, apiKey: e.target.value } })} 
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Get this from your Biteship Dashboard.</p>
                                </div>
                                <div>
                                    <label className={styles.label}>Environment</label>
                                    <select 
                                        className={styles.input} 
                                        value={config.biteship?.environment || 'production'} 
                                        onChange={e => setConfig({ ...config, biteship: { ...config.biteship, environment: e.target.value as any } })}
                                    >
                                        <option value="production">Production</option>
                                        <option value="sandbox">Sandbox</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '1.25rem' }}>2. Default Warehouse Origin</h4>
                            <div className={`${styles.inputGrid} ${styles.twoCol}`}>
                                <div>
                                    <label className={styles.label}>Sender Name</label>
                                    <input 
                                        type="text" 
                                        className={styles.input} 
                                        value={config.biteship?.warehouseName || ''} 
                                        onChange={e => setConfig({ ...config, biteship: { ...config.biteship, warehouseName: e.target.value } })} 
                                        placeholder={tenant.name}
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Sender Phone</label>
                                    <input 
                                        type="tel" 
                                        className={styles.input} 
                                        value={config.biteship?.warehousePhone || ''} 
                                        onChange={e => setConfig({ ...config, biteship: { ...config.biteship, warehousePhone: e.target.value } })} 
                                        placeholder="e.g. 08123456789"
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>Postal Code</label>
                                    <input 
                                        type="text" 
                                        className={styles.input} 
                                        value={config.biteship?.warehousePostal || ''} 
                                        onChange={e => setConfig({ ...config, biteship: { ...config.biteship, warehousePostal: e.target.value } })} 
                                        placeholder="e.g. 12345"
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Full Address</label>
                                    <textarea 
                                        className={styles.textarea} 
                                        value={config.biteship?.warehouseAddress || ''} 
                                        onChange={e => setConfig({ ...config, biteship: { ...config.biteship, warehouseAddress: e.target.value } })} 
                                        placeholder="Detailed origin address for courier pickup"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Socials */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBox}>
                            <div className={`${styles.iconBox} ${styles.contact}`}>
                                <Globe size={20} />
                            </div>
                            <h3>{t.contact}</h3>
                        </div>
                    </div>

                    <div className={`${styles.inputGrid} ${styles.twoCol}`}>
                        <div>
                            <label className={styles.label}><Mail size={14} /> {t.email}</label>
                            <input type="email" className={styles.input} value={theme.contact?.email || ''} onChange={e => setTheme({ ...theme, contact: { ...theme.contact, email: e.target.value } })} />
                        </div>
                        <div>
                            <label className={styles.label}><Phone size={14} /> {t.phone}</label>
                            <input type="text" className={styles.input} value={theme.contact?.phone || ''} onChange={e => setTheme({ ...theme, contact: { ...theme.contact, phone: e.target.value } })} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className={styles.label}><MapPin size={14} /> {t.address}</label>
                            <textarea className={styles.textarea} value={theme.contact?.address || ''} onChange={e => setTheme({ ...theme, contact: { ...theme.contact, address: e.target.value } })} />
                        </div>

                        <div className={styles.socialGrid}>
                            <label className={styles.socialLabel}>{t.social}</label>
                            <div className={styles.socialInputWrap}>
                                <Instagram size={16} color="#E1306C" />
                                <input type="text" className={styles.input} value={theme.socialLinks?.instagram || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, instagram: e.target.value } })} />
                            </div>
                            <div className={styles.socialInputWrap}>
                                <MessageCircle size={16} color="#25D366" />
                                <input type="text" className={styles.input} value={theme.socialLinks?.whatsapp || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, whatsapp: e.target.value } })} />
                            </div>
                            <div className={styles.socialInputWrap}>
                                <div className={styles.iconText} style={{ background: '#000' }}>TT</div>
                                <input type="text" className={styles.input} value={theme.socialLinks?.tiktok || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, tiktok: e.target.value } })} />
                            </div>
                            <div className={styles.socialInputWrap}>
                                <div className={styles.iconText} style={{ background: '#1877F2' }}>FB</div>
                                <input type="text" className={styles.input} value={theme.socialLinks?.facebook || ''} onChange={e => setTheme({ ...theme, socialLinks: { ...theme.socialLinks, facebook: e.target.value } })} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="submit"
                        disabled={isSaving || isUploading}
                        className={styles.saveBtn}
                    >
                        {isSaving ? <><Loader2 className="animate-spin" size={16} /> {t.saving}</> : <><Save size={20} /> {t.save}</>}
                    </button>
                </div>
            </div>

            {/* LIVE PREVIEW SIDEBAR */}
            <div className={styles.rightColumn}>
                <div className={styles.previewSection}>
                    <h4>{t.preview}</h4>

                    <div className={styles.mockStore}>
                        {/* Mock Navbar */}
                        <div className={styles.mockNav}>
                            <div className={styles.mockLogo}>
                                {logoUrl ? <img src={logoUrl} alt="logo" /> : <span>{tenant.name}</span>}
                            </div>
                            <div className={styles.mockNavLinks}>
                                <div /><div />
                            </div>
                        </div>

                        {/* Mock Hero */}
                        <div 
                            className={`${styles.mockHero} ${theme.heroBgUrl ? styles.hasBg : ''}`}
                            style={{ backgroundImage: theme.heroBgUrl ? `url(${theme.heroBgUrl})` : 'none' }}
                        >
                            <div className={styles.langFlags}>
                                <span>🇮🇩</span><span>🇬🇧</span>
                            </div>
                            <h1>
                                {config.language === 'en' 
                                    ? (theme.heroTitle_en || theme.heroTitle || storeDict.hero_title?.replace('{name}', tenant.name))
                                    : (theme.heroTitle || storeDict.hero_title?.replace('{name}', tenant.name))}
                            </h1>
                            <p>
                                {config.language === 'en' 
                                    ? (theme.heroDesc_en || theme.heroDesc || storeDict.hero_desc?.replace('{name}', tenant.name))
                                    : (theme.heroDesc || storeDict.hero_desc?.replace('{name}', tenant.name))}
                            </p>
                            <div className={styles.mockBtn}>
                                {storeDict.btn_order}
                            </div>
                        </div>

                        {/* Mock Badge */}
                        <div className={styles.mockBadge}>
                            <div className={styles.dot} />
                            <div className={styles.lines}>
                                <div /><div />
                            </div>
                        </div>
                    </div>

                    <div className={styles.previewStatus}>
                        <CheckCircle2 size={14} />
                        <span>Live preview updating...</span>
                    </div>
                </div>

                <div className={styles.proTip}>
                    <strong>Pro Tip:</strong> {t.pro_tip}
                </div>
            </div>
        </form>
    );
}
