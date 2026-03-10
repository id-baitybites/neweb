import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/config'
import { ShoppingBag, Package } from 'lucide-react'

export default async function ProfilePage() {
    const sessionUser = await getCurrentUser()

    if (!sessionUser) {
        redirect('/login?returnUrl=/profile')
    }

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id }
    })

    if (!user) redirect('/login')

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            orderItems: { include: { product: true } }
        }
    })

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <h1>Profil Saya</h1>
            <p style={{ color: '#888', marginBottom: '3rem' }}>Halo, {user.name}. Di sini Anda bisa melihat riwayat pesanan Anda.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem' }}>
                <aside style={{ background: 'white', padding: '2rem', borderRadius: '15px', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: 80, height: 80, background: '#FFB6C1', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                            {user.name ? user.name[0] : user.email[0].toUpperCase()}
                        </div>
                        <h3>{user.name || 'User'}</h3>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>{user.email}</p>
                    </div>
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <button style={{ width: '100%', padding: '0.8rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '0.5rem', textAlign: 'left' }}>Edit Profil</button>
                        <button style={{ width: '100%', padding: '0.8rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'left' }}>Alamat Pengiriman</button>
                    </div>
                </aside>

                <section>
                    <h2 style={{ marginBottom: '1.5rem' }}>Riwayat Pesanan</h2>

                    {orders.length === 0 ? (
                        <div style={{ background: 'white', padding: '4rem', borderRadius: '15px', textAlign: 'center', color: '#888' }}>
                            <ShoppingBag size={48} color="#eee" style={{ marginBottom: '1rem' }} />
                            <p>Anda belum memiliki pesanan.</p>
                            <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Mulai Belanja</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {orders.map((order: any) => (
                                <div key={order.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '10px' }}>
                                            <Package color="#FF69B4" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Order #{order.id.slice(-6).toUpperCase()}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString('id-ID')}</div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: '#FF69B4' }}>{formatPrice(order.total)}</div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            background: order.paymentStatus === 'PAID' ? '#E8F5E9' : '#FFF3E0',
                                            color: order.paymentStatus === 'PAID' ? '#4CAF50' : '#FF9800',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            display: 'inline-block',
                                            marginTop: '4px'
                                        }}>
                                            {order.paymentStatus}
                                        </div>
                                    </div>

                                    <Link href={`/order/status?id=${order.id}`} style={{ padding: '0.5rem 1rem', border: '1px solid #FFB6C1', color: '#FF69B4', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        Detail Order
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
