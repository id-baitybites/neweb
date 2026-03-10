'use client'

import React, { useState, useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'
import styles from '@/styles/modules/Checkout.module.scss'
import { createOrder } from '@/actions/order'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Package, Truck, Calendar, User, MapPin, Phone, Mail } from 'lucide-react'
import { useSocket } from '@/components/providers/SocketProvider'

// Declare snap on window
declare global {
    interface Window {
        snap: any;
    }
}

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
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
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const subtotal = totalPrice()
    const deliveryFee = method === 'DELIVERY' ? 25000 : 0
    const total = subtotal + deliveryFee

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || (method === 'DELIVERY' && !formData.address)) {
            toast.error('Mohon lengkapi data pengiriman')
            return
        }

        setLoading(true)
        const result = await createOrder({ ...formData, method }, items)

        if (result.success && result.token) {
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
            toast.error(result.error || 'Terjadi kesalahan saat membuat pesanan')
        }
        setLoading(false)
    }

    if (items.length === 0) return null

    return (
        <div className={`${styles.checkoutPage} container`}>
            <h1>Checkout</h1>

            <form onSubmit={handleSubmit} className={styles.grid}>
                <div className={styles.left}>
                    <section>
                        <h2>Metode Pengambilan</h2>
                        <div className={styles.methodToggle}>
                            <button
                                type="button"
                                className={method === 'DELIVERY' ? styles.active : ''}
                                onClick={() => setMethod('DELIVERY')}
                            >
                                <Truck size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Delivery
                            </button>
                            <button
                                type="button"
                                className={method === 'PICKUP' ? styles.active : ''}
                                onClick={() => setMethod('PICKUP')}
                            >
                                <Package size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Pick-up di Toko
                            </button>
                        </div>
                    </section>

                    <section>
                        <h2><User size={20} /> Informasi Kontak</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>Nama Lengkap</label>
                                <input name="name" required value={formData.name} onChange={handleInputChange} placeholder="Nama Anda" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Nomor WhatsApp</label>
                                <input name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="0812..." />
                            </div>
                            <div className={`${styles.inputGroup} ${styles.full}`}>
                                <label>Email (Opsional)</label>
                                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@contoh.com" />
                            </div>
                        </div>
                    </section>

                    {method === 'DELIVERY' && (
                        <section>
                            <h2><MapPin size={20} /> Alamat Pengiriman</h2>
                            <div className={styles.inputGroup}>
                                <textarea
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Alamat lengkap, patokan, atau instruksi pengiriman..."
                                />
                            </div>
                        </section>
                    )}

                    <section className={styles.datePicker}>
                        <h2><Calendar size={20} /> Tanggal Pre-order</h2>
                        <div className={styles.inputGroup}>
                            <label>Pilih Tanggal Pengiriman/Pengambilan</label>
                            <input type="date" name="date" required value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                            * Kami membutuhkan minimal H-1 untuk produksi. Slot terbatas per harinya.
                        </p>
                    </section>
                </div>

                <div className={styles.orderSummary}>
                    <section>
                        <h2>Ringkasan Pesanan</h2>
                        {items.map(item => (
                            <div key={item.id} className={styles.itemMini}>
                                <span><span className={styles.qty}>{item.quantity}x</span> {item.name}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}

                        <div className={styles.divider}></div>

                        <div className={styles.priceRow}>
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className={styles.priceRow}>
                            <span>Biaya {method === 'DELIVERY' ? 'Pengiriman' : 'Layanan'}</span>
                            <span>{formatPrice(deliveryFee)}</span>
                        </div>

                        <div className={`${styles.priceRow} ${styles.grandTotal}`}>
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`${styles.payBtn} btn-primary`}
                        >
                            {loading ? 'Memproses...' : 'Bayar Sekarang'}
                        </button>
                    </section>
                </div>
            </form>
        </div>
    )
}
