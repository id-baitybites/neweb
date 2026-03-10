import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Clock, CheckCircle, Package, Truck, AlertCircle } from 'lucide-react'
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={40} color="#FF9800" />
            case 'PROCESSING': return <Package size={40} color="#2196F3" />
            case 'READY': return <CheckCircle size={40} color="#4CAF50" />
            case 'SHIPPED': return <Truck size={40} color="#FF69B4" />
            case 'CANCELLED': return <AlertCircle size={40} color="#F44336" />
            default: return <Clock size={40} />
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '1rem' }}>{getStatusIcon(order.status)}</div>
                    <h1>Status Pesanan: {order.status}</h1>
                    <p style={{ color: '#888' }}>ID Pesanan: {order.id}</p>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                    <h3>Detail Pesanan</h3>
                    <div style={{ marginTop: '1.5rem' }}>
                        {order.orderItems.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span>{item.quantity}x {item.product.name}</span>
                                <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}

                        <div style={{ borderTop: '2px solid #f5f5f5', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            <span>Total</span>
                            <span style={{ color: '#FF69B4' }}>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Link href="/" className="btn-primary">Kembali Beranda</Link>
                    <Link href="/products" style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px' }}>Belanja Lagi</Link>
                </div>
            </div>
        </div>
    )
}
