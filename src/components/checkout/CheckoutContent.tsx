'use client'

import React, { useState, useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'
import styles from '@/styles/modules/Checkout.module.scss'
import { createOrder } from '@/actions/order'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Package, Truck, Calendar, User, MapPin, Phone, Mail, ArrowLeft, CreditCard } from 'lucide-react'
import { TenantData } from '@/lib/tenant'
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
}

export default function CheckoutContent({ tenant, customerProfile }: CheckoutContentProps) {
    const { items, totalPrice, clearCart } = useCartStore()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
    const [formData, setFormData] = useState({
        name: customerProfile?.name || '',
        email: customerProfile?.email || '',
        phone: customerProfile?.phone || '',
        address: customerProfile ? [customerProfile.addressLine, customerProfile.city, customerProfile.postalCode].filter(Boolean).join(', ') : '',
        date: '',
    })

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart')
        }
    }, [items, router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(tenant.config.language === 'id' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: tenant.config.currency,
            minimumFractionDigits: 0,
        }).format(price)
    }

    const subtotal = totalPrice()
    const deliveryFee = method === 'DELIVERY' ? tenant.config.deliveryFee : 0
    const total = subtotal + deliveryFee

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || (method === 'DELIVERY' && !formData.address)) {
            toast.error('Mohon lengkapi data pengiriman')
            return
        }

        if (!formData.date) {
            toast.error('Mohon pilih tanggal pengambilan/pengiriman')
            return
        }

        setLoading(true)
        try {
            const result = await createOrder({ ...formData, method }, items)

            if (result.success && result.token) {
                if (window.snap) {
                    window.snap.pay(result.token, {
                        onSuccess: (result: any) => {
                            toast.success('Pembayaran Berhasil!')
                            clearCart()
                            router.push(`/order/success?id=${result.order_id}`)
                        },
                        onPending: (result: any) => {
                            toast.info('Menunggu Pembayaran...')
                            clearCart()
                            router.push(`/order/status?id=${result.order_id}`)
                        },
                        onError: (result: any) => {
                            toast.error('Pembayaran Gagal!')
                        },
                        onClose: () => {
                            toast.warning('Anda menutup pembayaran sebelum selesai')
                        },
                    })
                } else {
                    toast.error('Payment gateway properly not loaded. Please refresh.')
                }
            } else {
                toast.error(result.error || 'Terjadi kesalahan saat membuat pesanan')
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
                <Link href="/cart" className={styles.backBtn}>
                    <ArrowLeft size={18} /> Kembali ke Keranjang
                </Link>
                <h1>Selesaikan Pesanan Anda</h1>
                <p className={styles.subtitle}>Checkout di {tenant.name}</p>
            </div>

            {isProfileIncomplete && (
                <div style={{ background: '#fff9f0', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.8rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#9a3412', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>💡 Simpan data Anda agar checkout lebih cepat lain kali.</span>
                    <Link href="/profile" style={{ fontWeight: 700, color: '#c2410c', textDecoration: 'none' }}>Lengkapi Profil →</Link>
                </div>
            )}

            {!customerProfile && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '0.8rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#0c4a6e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🚀 Login untuk checkout lebih cepat dengan data tersimpan.</span>
                    <Link href="/login?returnUrl=/checkout" style={{ fontWeight: 700, color: '#0369a1', textDecoration: 'none' }}>Login / Daftar →</Link>
                </div>
            )}
            <form onSubmit={handleSubmit} className={styles.grid}>
                <div className={styles.left}>
                    <section className={styles.methodSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconBox} style={{ backgroundColor: 'var(--color-primary)' }}>
                                <Truck size={20} color="white" />
                            </div>
                            <h2>Metode Pengambilan</h2>
                        </div>
                        <div className={styles.methodToggle}>
                            <button
                                type="button"
                                className={method === 'DELIVERY' ? styles.active : ''}
                                onClick={() => setMethod('DELIVERY')}
                            >
                                <Truck size={20} /> <span>Delivery</span>
                            </button>
                            <button
                                type="button"
                                className={method === 'PICKUP' ? styles.active : ''}
                                onClick={() => setMethod('PICKUP')}
                            >
                                <Package size={20} /> <span>Pick-up</span>
                            </button>
                        </div>
                    </section>

                    <section>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconBox} style={{ backgroundColor: 'var(--color-secondary)' }}>
                                <User size={20} color="white" />
                            </div>
                            <h2>Informasi Pemesan</h2>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>Nama Lengkap</label>
                                <input name="name" required value={formData.name} onChange={handleInputChange} placeholder="Nama penanggung jawab" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Nomor WhatsApp</label>
                                <div className={styles.inputWrapper}>
                                    <Phone size={16} className={styles.inputIcon} />
                                    <input name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="08xxx" type="tel" />
                                </div>
                            </div>
                            <div className={`${styles.inputGroup} ${styles.full}`}>
                                <label>Email (Opsional)</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={16} className={styles.inputIcon} />
                                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@contoh.com" />
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
                                <h2>Alamat Pengiriman</h2>
                            </div>
                            <div className={styles.inputGroup}>
                                <textarea
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Jl. Merdeka No. 1, Kec. Coblong, Kota Bandung (Sebelah Indomaret)"
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
                            <h2>Waktu Pesanan</h2>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Pilih Tanggal {method === 'DELIVERY' ? 'Pengiriman' : 'Pengambilan'}</label>
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
                            <strong>Catatan:</strong> Kami membutuhkan minimal {tenant.config.minPreOrderDays || 1} hari untuk persiapan pesanan Anda.
                        </div>
                    </section>
                </div>

                <div className={styles.right}>
                    <div className={styles.orderSummary}>
                        <div className={styles.summaryTop}>
                             <h2>Ringkasan Pesanan</h2>
                             <p>{items.length} Produk terpilih</p>
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
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className={styles.priceRow}>
                                <span>Biaya {method === 'DELIVERY' ? 'Pengiriman' : 'Layanan'}</span>
                                <span className={deliveryFee > 0 ? '' : styles.freeText}>
                                    {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratis'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.totalSection}>
                            <div className={styles.totalLabel}>Total Pembayaran</div>
                            <div className={styles.totalValue}>{formatPrice(total)}</div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.payBtn}
                        >
                            {loading ? (
                                <><div className={styles.spinner}></div> Memproses...</>
                            ) : (
                                <><CreditCard size={20} /> Bayar Sekarang</>
                            )}
                        </button>
                        
                        <div className={styles.secureNote}>
                            <Package size={14} /> Transaksi Aman & Terenkripsi
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
