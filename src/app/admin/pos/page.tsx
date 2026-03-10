'use client'

import React, { useState } from 'react'
import styles from '@/styles/modules/Admin.module.scss'
import { Search, ShoppingCart, Plus, Minus, User, CreditCard } from 'lucide-react'

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([])

    const products = [
        { id: '1', name: 'Red Velvet', price: 350000 },
        { id: '2', name: 'Chocolate Ganache', price: 320000 },
        { id: '3', name: 'Strawberry Shortcake', price: 280000 },
    ]

    const addToCart = (product: any) => {
        const existing = cart.find(c => c.id === product.id)
        if (existing) {
            setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c))
        } else {
            setCart([...cart, { ...product, qty: 1 }])
        }
    }

    const total = cart.reduce((acc, current) => acc + (current.price * current.qty), 0)

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', height: 'calc(100vh - 150px)' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', overflowY: 'auto' }}>
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} size={20} />
                    <input
                        type="text"
                        placeholder="Cari produk atau scan barcode..."
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid #eee', borderRadius: '10px' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {products.map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{ height: '80px', background: '#f5f5f5', marginBottom: '0.5rem', borderRadius: '8px' }}></div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                            <div style={{ color: '#FF69B4', fontSize: '0.8rem' }}>Rp {p.price.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <ShoppingCart size={20} /> Keranjang (POS)
                </h3>

                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f5f5f5' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.qty} x Rp {item.price.toLocaleString()}</div>
                            </div>
                            <div style={{ fontWeight: 600 }}>Rp {(item.qty * item.price).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', borderTop: '2px dashed #eee', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        <span>TOTAL</span>
                        <span style={{ color: '#FF69B4' }}>Rp {total.toLocaleString()}</span>
                    </div>

                    <button className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
                        <CreditCard size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Proses Pembayaran
                    </button>
                </div>
            </div>
        </div>
    )
}
