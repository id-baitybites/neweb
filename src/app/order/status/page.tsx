import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Clock, CheckCircle, Package, Truck, AlertCircle, ShoppingBag, MapPin, Phone, User, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
    searchParams: {
        id: string
    }
}

export default async function OrderStatusPage({ searchParams }: Props) {
    const { id } = await searchParams
    if (!id) notFound()

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            orderItems: {
                include: { product: true }
            },
            delivery: true
        }
    })

    if (!order) notFound()

    const statusSteps = [
        { key: 'PENDING', label: 'Pesanan Diterima', icon: <Clock size={18} />, color: '#f97316' },
        { key: 'PROCESSING', label: 'Sedang Diproses', icon: <Package size={18} />, color: '#3b82f6' },
        { key: 'READY', label: 'Siap Dikirim/Ambil', icon: <CheckCircle size={18} />, color: '#22c55e' },
        { key: 'SHIPPED', label: 'Sedang Diperjalanan', icon: <Truck size={18} />, color: '#FF69B4' },
        { key: 'COMPLETED', label: 'Selesai', icon: <ShoppingBag size={18} />, color: '#059669' },
    ]

    const currentIndex = statusSteps.findIndex(s => s.key === order.status)

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f9 0%, #fafafa 100%)', padding: '4rem 1rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Header Section */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <span style={{ background: '#fff1f2', color: '#e11d48', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Rincian Pesanan
                            </span>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '12px 0 4px', color: '#1a1a1a' }}>Order #{id.slice(-8).toUpperCase()}</h1>
                            <p style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <Calendar size={16} /> {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FF69B4' }}>{formatPrice(order.total)}</div>
                            <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>{order.orderItems.length} Produk</div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div style={{ marginTop: '3rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#f0f0f0', zIndex: 0 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            {statusSteps.map((step, i) => {
                                const isDone = i <= currentIndex
                                const isCurrent = step.key === order.status
                                return (
                                    <div key={step.key} style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{ 
                                            width: 32, height: 32, borderRadius: '50%', margin: '0 auto 12px',
                                            background: isDone ? step.color : '#fff',
                                            border: isDone ? `2px solid ${step.color}` : '2px solid #ddd',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isDone ? 'white' : '#ddd',
                                            boxShadow: isCurrent ? `0 0 0 4px ${step.color}22` : 'none',
                                            transition: 'all 0.3s'
                                        }}>
                                            {isDone ? <CheckCircle size={16} /> : step.icon}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isDone ? '#1a1a1a' : '#aaa', textTransform: 'uppercase' }}>
                                            {step.label}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
                    {/* Left: Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShoppingBag size={20} color="#FF69B4" /> Item Pesanan
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {order.orderItems.map((item: any) => (
                                    <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '12px', background: '#f8f8f8', overflow: 'hidden', flexShrink: 0 }}>
                                            {item.product.imageUrl && <img src={item.product.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.product.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{item.quantity} x {formatPrice(item.price)}</div>
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{formatPrice(item.price * item.quantity)}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: '2px dashed #f0f0f0', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.2rem' }}>
                                    <span>Total Bayar</span>
                                    <span style={{ color: '#FF69B4' }}>{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Informasi Pengiriman</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        <User size={14} /> Penerima
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.customerName}</div>
                                    <div style={{ color: '#888', fontSize: '0.9rem' }}>{order.customerPhone}</div>
                                </div>

                                {order.delivery && (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            <MapPin size={14} /> Alamat
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#444', lineHeight: 1.5 }}>
                                            {order.delivery.address}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                             <Link href="/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', background: 'white', borderRadius: '16px', color: '#1a1a1a', fontWeight: 700, textDecoration: 'none', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                Lihat Semua Pesanan <ChevronRight size={18} />
                             </Link>
                             <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', background: 'linear-gradient(135deg, #FF69B4, #e55da0)', borderRadius: '16px', color: 'white', fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 20px rgba(255,105,180,0.3)' }}>
                                Kembali Belanja
                             </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

