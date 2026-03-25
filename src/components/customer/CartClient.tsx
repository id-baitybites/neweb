'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import styles from '@/styles/modules/Cart.module.scss'
import { toast } from 'sonner'

export default function CartClient({ tenantId, dict }: { tenantId?: string; dict: any }) {
    const t = dict.cart
    const { getTenantItems, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {t.loading}
        </div>
    )

    const items = tenantId ? getTenantItems(tenantId) : []

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(dict.locale === 'id' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    if (items.length === 0) {
        return (
            <div className={styles.cartPage}>
                <div className={styles.emptyCart}>
                    <div style={{ background: '#FFF5F7', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
                        <ShoppingBag size={64} color="#FF69B4" />
                    </div>
                    <h2>{t.empty_title}</h2>
                    <p style={{ color: '#64748B', maxWidth: '300px', margin: '0 auto 2.5rem' }}>
                        {t.empty_desc}
                    </p>
                    <Link href="/" className="btn-primary" style={{ padding: '1rem 2.5rem' }}>
                        {t.view_products}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.cartPage}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '3rem', color: '#0F172A' }}>
                {t.title}
            </h1>

            <div className={styles.grid}>
                <div className={styles.cartItems}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div className={styles.imageWrapper}>
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} />
                                ) : (
                                    <div style={{ height: '100%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                        {t.no_image}
                                    </div>
                                )}
                            </div>

                            <div className={styles.details}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.name}</h3>
                                {item.customization && (
                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                        <span>{t.flavor || (dict.locale === 'id' ? 'Rasa' : 'Flavor')}: {dict.product_detail?.[item.customization.flavor] || item.customization.flavor}</span> • 
                                        <span> {t.size || (dict.locale === 'id' ? 'Ukuran' : 'Size')}: {dict.product_detail?.[item.customization.size] || item.customization.size}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.priceQty}>
                                <span className={styles.itemPrice}>{formatPrice(item.price)}</span>

                                <div className={styles.qtyActions}>
                                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontWeight: 700, width: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button 
                                    className={styles.remove} 
                                    onClick={() => {
                                        removeItem(item.id)
                                        toast.error(t.remove_toast)
                                    }}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}
                                >
                                    <Trash2 size={14} />
                                    {t.remove}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.summary} style={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: '32px', padding: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>{t.summary_title}</h2>

                    <div className={styles.row} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748B' }}>
                        <span>{t.subtotal.replace('{count}', totalItems(tenantId).toString())}</span>
                        <span>{formatPrice(totalPrice(tenantId))}</span>
                    </div>

                    <div className={styles.row} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#64748B' }}>
                        <span>{t.platform_fee}</span>
                        <span>{t.free_service}</span>
                    </div>

                    <div style={{ borderTop: '2px dashed #F1F5F9', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900 }}>
                            <span>{t.total}</span>
                            <span style={{ color: '#4F46E5' }}>{formatPrice(totalPrice(tenantId))}</span>
                        </div>
                    </div>

                    <Link 
                        href="/checkout" 
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.25rem', borderRadius: '16px' }}
                    >
                        {t.continue_to_checkout} <ArrowRight size={20} />
                    </Link>

                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '1.5rem', textAlign: 'center', lineHeight: 1.5 }}>
                        {t.tax_note}
                    </p>
                </div>
            </div>
        </div>
    )
}
