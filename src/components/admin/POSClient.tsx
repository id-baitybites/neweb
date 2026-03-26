'use client'

import React, { useState } from 'react'
import { Search, ShoppingCart, CreditCard } from 'lucide-react'
import { getSafeCurrency } from '@/lib/config'

export default function POSClient({ dict, tenant, initialProducts }: { dict: any, tenant: any, initialProducts: any[] }) {
    const t = dict.admin.pos
    const [cart, setCart] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    const formatPrice = (price: number) => {
        const currencyCode = getSafeCurrency(tenant.config?.currency || 'IDR')
        return new Intl.NumberFormat(tenant.config?.language || 'id-ID', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
        }).format(price)
    }

    const addToCart = (product: any) => {
        const existing = cart.find(c => c.id === product.id)
        if (existing) {
            setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c))
        } else {
            setCart([...cart, { ...product, qty: 1 }])
        }
    }

    const total = cart.reduce((acc, current) => acc + (current.price * current.qty), 0)

    const filteredProducts = initialProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', height: 'calc(100vh - 150px)' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', overflowY: 'auto' }}>
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} size={20} />
                    <input
                        type="text"
                        placeholder={t.search_placeholder}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid #eee', borderRadius: '10px' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {filteredProducts.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#888' }}>
                            {t.no_products}
                        </div>
                    ) : filteredProducts.map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} style={{ border: '1px solid #eee', padding: '1.25rem', borderRadius: '15px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ height: '100px', background: '#f8f9fa', marginBottom: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: '#ccc', fontSize: '0.8rem' }}>No image</span>
                                )}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{p.name}</div>
                            <div style={{ color: '#FF69B4', fontSize: '0.9rem', fontWeight: 600 }}>{formatPrice(p.price)}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>
                    <ShoppingCart size={24} style={{ color: '#FF69B4' }} /> {t.cart_title}
                </h3>

                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888', fontSize: '0.9rem' }}>
                            {t.empty_cart}
                        </div>
                    ) : cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f8f9fa' }}>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{item.qty} x {formatPrice(item.price)}</div>
                            </div>
                            <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{formatPrice(item.qty * item.price)}</div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', borderTop: '2px dashed #f0f0f0', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem' }}>
                        <span>{t.total}</span>
                        <span style={{ color: '#FF69B4' }}>{formatPrice(total)}</span>
                    </div>

                    <button 
                        className="btn-primary" 
                        disabled={cart.length === 0}
                        style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 8px 20px rgba(255, 105, 180, 0.3)', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', opacity: cart.length === 0 ? 0.6 : 1 }}
                    >
                        <CreditCard size={20} /> {t.btn_pay}
                    </button>
                </div>
            </div>
        </div>
    )
}
