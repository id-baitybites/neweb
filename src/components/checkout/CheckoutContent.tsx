'use client'

import React, { useState, useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'
import styles from '@/styles/modules/Checkout.module.scss'
import { createOrder } from '@/actions/order'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Package, Truck, Calendar, User, MapPin, Phone, Mail, ArrowLeft, CreditCard } from 'lucide-react'
import { TenantData } from '@/lib/tenant'
import { getSafeCurrency } from '@/lib/config'
import Link from 'next/link'

interface CheckoutContentProps {
    tenant: TenantData;
    customerProfile?: {
        name: string | null;
        email: string;
        phone: string | null;
        addressLine: string | null;
        city: string | null;
        postalCode: string | null;
        notes: string | null;
    } | null;
    dict: any;
}

export default function CheckoutContent({ tenant, customerProfile, dict }: CheckoutContentProps) {
    const t = dict.checkout
    const { getTenantItems, totalPrice, clearTenantCart } = useCartStore()
    const router = useRouter()
    
    // Scoped state
    const items = getTenantItems(tenant.id)
    const subtotal = totalPrice(tenant.id)
    const prefix = `/${tenant.slug}`
    
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
    const [formData, setFormData] = useState({
        name: customerProfile?.name || '',
        email: customerProfile?.email || '',
        phone: customerProfile?.phone || '',
        address: customerProfile ? [customerProfile.addressLine, customerProfile.city, customerProfile.postalCode].filter(Boolean).join(', ') : '',
        date: '',
    })

    useEffect(() => {
        if (mounted && items.length === 0) {
            router.push(`${prefix}/cart`)
        }
    }, [items.length, router, prefix, mounted])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(tenant.config.language === 'id' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: getSafeCurrency(tenant.config.currency),
            minimumFractionDigits: 0,
        }).format(price)
    }

    const deliveryFee = method === 'DELIVERY' ? tenant.config.deliveryFee : 0
    const total = subtotal + deliveryFee

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || (method === 'DELIVERY' && !formData.address)) {
            toast.error(t.toast.complete_shipping)
            return
        }

        if (!formData.date) {
            toast.error(t.toast.choose_date)
            return
        }

        setLoading(true)
        try {
            const result = await createOrder({ ...formData, method }, items)

            if (result.success && result.token) {
                if (window.snap) {
                    window.snap.pay(result.token, {
                        onSuccess: (result: any) => {
                            toast.success(t.toast.pay_success)
                            clearTenantCart(tenant.id)
                            router.push(`${prefix}/order/success?id=${result.order_id}`)
                        },
                        onPending: (result: any) => {
                            toast.info(t.toast.pay_pending)
                            clearTenantCart(tenant.id)
                            router.push(`${prefix}/order/status?id=${result.order_id}`)
                        },
                        onError: (result: any) => {
                            toast.error(t.toast.pay_error)
                        },
                        onClose: () => {
                            toast.warning(t.toast.pay_close)
                        },
                    })
                } else {
                    toast.error(t.toast.gateway_error)
                }
            } else {
                toast.error(result.error || t.toast.order_error)
            }
        } catch (err: any) {
            toast.error(err.message || 'Error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Calculate min date based on tenant config
    const getMinDate = () => {
        const date = new Date()
        date.setDate(date.getDate() + (tenant.config.minPreOrderDays || 1))
        return date.toISOString().split('T')[0]
    }

    if (items.length === 0) return null

    const isProfileIncomplete = customerProfile && (!customerProfile.phone || !customerProfile.addressLine)

    return (
        <div className={`${styles.checkoutPage} container`}>
            <div className={styles.header}>
                <Link href={`${prefix}/cart`} className={styles.backBtn}>
                    <ArrowLeft size={18} /> {t.back}
                </Link>
                <h1>{t.title}</h1>
                <p className={styles.subtitle}>{t.subtitle.replace('{name}', tenant.name)}</p>
            </div>

            {isProfileIncomplete && (
                <div style={{ background: '#fff9f0', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.8rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#9a3412', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>💡 {t.profile_tip}</span>
                    <Link href={`${prefix}/profile`} style={{ fontWeight: 700, color: '#c2410c', textDecoration: 'none' }}>{t.profile_link}</Link>
                </div>
            )}

            {!customerProfile && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '0.8rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#0c4a6e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🚀 {t.login_tip}</span>
                    <Link href={`${prefix}/login?returnUrl=${prefix}/checkout`} style={{ fontWeight: 700, color: '#0369a1', textDecoration: 'none' }}>{t.login_link}</Link>
                </div>
            )}
            <form onSubmit={handleSubmit} className={styles.grid}>
                <div className={styles.left}>
                    <section className={styles.methodSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconBox} style={{ backgroundColor: 'var(--color-primary)' }}>
                                <Truck size={20} color="white" />
                            </div>
                            <h2>{t.method_title}</h2>
                        </div>
                        <div className={styles.methodToggle}>
                            <button
                                type="button"
                                className={method === 'DELIVERY' ? styles.active : ''}
                                onClick={() => setMethod('DELIVERY')}
                            >
                                <Truck size={20} /> <span>{t.delivery}</span>
                            </button>
                            <button
                                type="button"
                                className={method === 'PICKUP' ? styles.active : ''}
                                onClick={() => setMethod('PICKUP')}
                            >
                                <Package size={20} /> <span>{t.pickup}</span>
                            </button>
                        </div>
                    </section>

                    <section>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconBox} style={{ backgroundColor: 'var(--color-secondary)' }}>
                                <User size={20} color="white" />
                            </div>
                            <h2>{t.info_title}</h2>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>{t.name}</label>
                                <input name="name" required value={formData.name} onChange={handleInputChange} placeholder={t.name_placeholder} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t.phone}</label>
                                <div className={styles.inputWrapper}>
                                    <Phone size={16} className={styles.inputIcon} />
                                    <input name="phone" required value={formData.phone} onChange={handleInputChange} placeholder={t.phone_placeholder} type="tel" />
                                </div>
                            </div>
                            <div className={`${styles.inputGroup} ${styles.full}`}>
                                <label>{t.email}</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={16} className={styles.inputIcon} />
                                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder={t.email_placeholder} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {method === 'DELIVERY' && (
                        <section className={styles.animateIn}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.iconBox} style={{ backgroundColor: '#EF4444' }}>
                                    <MapPin size={20} color="white" />
                                </div>
                                <h2>{t.address_title}</h2>
                            </div>
                            <div className={styles.inputGroup}>
                                <textarea
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder={t.address_placeholder}
                                    rows={3}
                                />
                            </div>
                        </section>
                    )}

                    <section>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconBox} style={{ backgroundColor: 'var(--color-accent)' }}>
                                <Calendar size={20} color="white" />
                            </div>
                            <h2>{t.time_title}</h2>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{t.date_label.replace('{method}', method === 'DELIVERY' ? t.delivery : t.pickup)}</label>
                            <input 
                                type="date" 
                                name="date" 
                                required 
                                value={formData.date} 
                                onChange={handleInputChange} 
                                min={getMinDate()} 
                            />
                        </div>
                        <div className={styles.infoNote}>
                            {t.prep_note.replace('{days}', (tenant.config.minPreOrderDays || 1).toString())}
                        </div>
                    </section>
                </div>

                <div className={styles.right}>
                    <div className={styles.orderSummary}>
                        <div className={styles.summaryTop}>
                             <h2>{t.summary_title}</h2>
                             <p>{t.items_selected.replace('{count}', items.length.toString())}</p>
                        </div>
                        
                        <div className={styles.itemList}>
                            {items.map(item => (
                                <div key={item.id} className={styles.itemMini}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemQty}>{item.quantity}x</span>
                                        <span className={styles.itemName}>{item.name}</span>
                                    </div>
                                    <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.priceDetails}>
                            <div className={styles.priceRow}>
                                <span>{t.subtotal}</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className={styles.priceRow}>
                                <span>{method === 'DELIVERY' ? t.fee_delivery : t.fee_service}</span>
                                <span className={deliveryFee > 0 ? '' : styles.freeText}>
                                    {deliveryFee > 0 ? formatPrice(deliveryFee) : t.free}
                                </span>
                            </div>
                        </div>

                        <div className={styles.totalSection}>
                            <div className={styles.totalLabel}>{t.total_label}</div>
                            <div className={styles.totalValue}>{formatPrice(total)}</div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.payBtn}
                        >
                            {loading ? (
                                <><div className={styles.spinner}></div> {t.processing}</>
                            ) : (
                                <><CreditCard size={20} /> {t.pay_now}</>
                            )}
                        </button>
                        
                        <div className={styles.secureNote}>
                            <Package size={14} /> {t.secure_note}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
