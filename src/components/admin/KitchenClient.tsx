'use client'

import React, { useState } from 'react'
import { CheckCircle, Clock, ChefHat, Truck } from 'lucide-react'
import { OrderStatus } from '@prisma/client'

interface KitchenClientProps {
    dict: any;
}

export default function KitchenClient({ dict }: KitchenClientProps) {
    const t = dict.admin.kitchen
    
    const [orders, setOrders] = useState<any[]>([
        {
            id: 'ORD-101',
            customer: 'Budi Santoso',
            items: [
                { name: 'Red Velvet Cake', qty: 1, custom: 'Pesan: HBD Ibu!' },
                { name: 'Red Velvet Cake', qty: 1, custom: 'Pesan: HBD Ibu!' }
            ],
            status: 'PROCESSING',
            time: '14:30',
        },
        {
            id: 'ORD-102',
            customer: 'Ani Wijaya',
            items: [
                { name: 'Chocolate Ganache', qty: 2, custom: 'Tanpa Topping Kismis' }
            ],
            status: 'PENDING',
            time: '14:45',
        }
    ])

    const getStatusColor = (status: string) => {
        switch (status) {
            case OrderStatus.PENDING: return '#FF9800'
            case OrderStatus.PROCESSING: return '#2196F3'
            case OrderStatus.READY: return '#4CAF50'
            default: return '#888'
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>{t.title}</h1>
                <div style={{ display: 'flex', gap: '1rem', color: '#4CAF50', fontWeight: 'bold' }}>
                    <Clock size={20} /> {t.connected}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {orders.map((order) => (
                    <div key={order.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: `5px solid ${getStatusColor(order.status)}` }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{t.order_id.replace('{id}', order.id)}</span>
                                <h3 style={{ margin: '0.2rem 0' }}>{order.customer}</h3>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: getStatusColor(order.status) }}>
                                {order.status}
                            </span>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                        <span>{item.qty}x {item.name}</span>
                                    </div>
                                    {item.custom && <p style={{ fontSize: '0.85rem', color: '#8B4513', fontStyle: 'italic', marginTop: '4px' }}>- {item.custom}</p>}
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '1rem 1.5rem', background: '#fcfcfc', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
                            {order.status === OrderStatus.PENDING && (
                                <button className="btn-primary" style={{ flex: 1, background: '#2196F3' }}>
                                    <ChefHat size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {t.btn_process}
                                </button>
                            )}
                            {order.status === OrderStatus.PROCESSING && (
                                <button className="btn-primary" style={{ flex: 1, background: '#4CAF50' }}>
                                    <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {t.btn_ready}
                                </button>
                            )}
                            {order.status === OrderStatus.READY && (
                                <button className="btn-primary" style={{ flex: 1, background: '#FF69B4' }}>
                                    <Truck size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {t.btn_ship}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
