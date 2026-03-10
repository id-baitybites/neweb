'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import styles from '@/styles/modules/Cart.module.scss'
import { toast } from 'sonner'

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    if (items.length === 0) {
        return (
            <div className={`${styles.cartPage} container`}>
                <div className={styles.emptyCart}>
                    <ShoppingBag size={64} color="#FFB6C1" style={{ marginBottom: '1.5rem' }} />
                    <h2>Keranjang Anda Kosong</h2>
                    <p>Sepertinya Anda belum menambahkan kue lezat ke keranjang.</p>
                    <Link href="/" className="btn-primary">
                        Lihat Produk Kami
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`${styles.cartPage} container`}>
            <h1>Keranjang Belanja</h1>

            <div className={styles.grid}>
                <div className={styles.cartItems}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div className={styles.imageWrapper}>
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div style={{ height: '100%', background: '#eee' }} />}
                            </div>

                            <div className={styles.details}>
                                <h3>{item.name}</h3>
                                {item.customization && (
                                    <div className={styles.customInfo}>
                                        <div>Rasa: {item.customization.flavor}</div>
                                        <div>Ukuran: {item.customization.size}</div>
                                        <div>Topping: {item.customization.topping}</div>
                                        {item.customization.message && (
                                            <div style={{ fontStyle: 'italic', marginTop: '4px' }}>
                                                "{item.customization.message}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={styles.priceQty}>
                                <span className={styles.itemPrice}>{formatPrice(item.price)}</span>

                                <div className={styles.qtyActions}>
                                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                                        <Minus size={16} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className={styles.remove} onClick={() => {
                                    removeItem(item.id)
                                    toast.error('Produk dihapus dari keranjang')
                                }}>
                                    <Trash2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                    Hapus
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.summary}>
                    <h2>Ringkasan Pesanan</h2>

                    <div className={styles.row}>
                        <span>Subtotal ({totalItems()} item)</span>
                        <span>{formatPrice(totalPrice())}</span>
                    </div>

                    <div className={styles.row}>
                        <span>Pajak (Sudah termasuk)</span>
                        <span>Rp 0</span>
                    </div>

                    <div className={`${styles.row} ${styles.total}`}>
                        <span>Total</span>
                        <span>{formatPrice(totalPrice())}</span>
                    </div>

                    <Link href="/checkout" className={`${styles.checkoutBtn} btn-primary`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        Lanjut ke Pembayaran <ArrowRight size={20} />
                    </Link>

                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1.5rem', textAlign: 'center' }}>
                        * Biaya pengiriman akan dihitung di halaman berikutnya.
                    </p>
                </div>
            </div>
        </div>
    )
}
