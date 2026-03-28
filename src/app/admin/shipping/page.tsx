'use client'

import React, { useState, useEffect } from 'react'
import { Truck, Search, Loader2, Package, MapPin, X } from 'lucide-react'
import { toast } from 'sonner'
import styles from '@/styles/modules/Shipping.module.scss'

export default function ShippingAdminPage() {
    const [rates, setRates] = useState<any[]>([])
    const [shipments, setShipments] = useState<any[]>([])
    const [isLoadingRates, setIsLoadingRates] = useState(false)
    const [isLoadingShipments, setIsLoadingShipments] = useState(true)

    // Form states
    const [originPostal, setOriginPostal] = useState('12345')
    const [destPostal, setDestPostal] = useState('')
    const [weight, setWeight] = useState('1000') // grams
    const [couriers, setCouriers] = useState('jne,jnt,sicepat,anteraja,ninja')

    // Order Creation Modal State
    const [selectedRate, setSelectedRate] = useState<any>(null)
    const [isCreatingOrder, setIsCreatingOrder] = useState(false)
    const [orderForm, setOrderForm] = useState({
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        itemDescription: 'Cake/Food Package',
        itemValue: '100000',
    })

    useEffect(() => {
        fetchShipments()
    }, [])

    const fetchShipments = async () => {
        try {
            const res = await fetch('/api/shipping/orders')
            const data = await res.json()
            if (data.shipments) setShipments(data.shipments)
        } catch (err) {
            toast.error('Failed to load shipments')
        } finally {
            setIsLoadingShipments(false)
        }
    }

    const checkRates = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!destPostal) return toast.error('Destination postal code required')

        setIsLoadingRates(true)
        setRates([])
        setSelectedRate(null)
        try {
            const res = await fetch('/api/shipping/rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin_postal_code: originPostal,
                    destination_postal_code: destPostal,
                    weight: Number(weight),
                    couriers,
                }),
            })

            const data = await res.json()
            if (res.ok && data.success) {
                setRates(data.pricing || [])
                if (!data.pricing?.length) toast.info('No rates found for the given locations')
            } else {
                toast.error(data.error || 'Failed to check rates')
            }
        } catch (err) {
            toast.error('Unexpected error checking rates')
        } finally {
            setIsLoadingRates(false)
        }
    }

    const createOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRate) return

        setIsCreatingOrder(true)
        try {
            const payload = {
                ...orderForm,
                senderPostal: originPostal,
                receiverPostal: destPostal,
                weightGrams: weight,
                courierCode: selectedRate.courier_code,
                courierName: selectedRate.courier_name,
                serviceType: selectedRate.courier_service_code,
                serviceLabel: selectedRate.courier_service_name,
                price: selectedRate.price,
                estimatedDay: 2 // Biteship rate doesn't strictly give integer days, mocking 2 for now
            }

            const res = await fetch('/api/shipping/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (res.ok && data.success) {
                toast.success('Shipment order created successfully!')
                setSelectedRate(null) // close modal
                fetchShipments() // refresh list
            } else {
                toast.error(data.error || 'Failed to create shipment order')
            }
        } catch (err) {
            toast.error('Error creating shipment')
        } finally {
            setIsCreatingOrder(false)
        }
    }

    const mapStatus = (status: string) => {
        const s = status.toLowerCase()
        if (['pending'].includes(s)) return 'pending'
        if (['allocating', 'picking_up', 'picked'].includes(s)) return 'picking_up'
        if (['dropping_off'].includes(s)) return 'in_transit'
        if (['delivered'].includes(s)) return 'delivered'
        return 'cancelled'
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>Shipping & Operations</h1>
                <p style={{ color: '#64748b' }}>Manage your biteship integration, check rates, and monitor ongoing shipments.</p>
            </div>

            <div className={styles.shippingGrid}>
                {/* Cost Checker Form */}
                <div className={styles.card}>
                    <h3><Search size={18} /> Cost Checker & Simulator</h3>
                    <form onSubmit={checkRates}>
                        <div className={styles.inputGroup}>
                            <label>Origin Postal Code</label>
                            <input 
                                type="text" 
                                value={originPostal} 
                                onChange={(e) => setOriginPostal(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Destination Postal Code</label>
                            <input 
                                type="text" 
                                value={destPostal} 
                                onChange={(e) => setDestPostal(e.target.value)} 
                                placeholder="e.g. 50131"
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Weight (grams)</label>
                            <input 
                                type="number" 
                                value={weight} 
                                onChange={(e) => setWeight(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Couriers (comma separated)</label>
                            <input 
                                type="text" 
                                value={couriers} 
                                onChange={(e) => setCouriers(e.target.value)} 
                            />
                        </div>
                        
                        <button type="submit" className={styles.btn} disabled={isLoadingRates}>
                            {isLoadingRates ? <Loader2 className="animate-spin" size={18} /> : 'Check Rates'}
                        </button>
                    </form>

                    {rates.length > 0 && (
                        <div className={styles.ratesList}>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Click a rate to create a shipment.</p>
                            {rates.map((r, i) => (
                                <div 
                                    key={i} 
                                    className={`${styles.rateCard} ${selectedRate?.courier_name === r.courier_name && selectedRate?.courier_service_code === r.courier_service_code ? styles.selected : ''}`}
                                    onClick={() => setSelectedRate(r)}
                                >
                                    <div className={styles.courierInfo}>
                                        <strong>{r.courier_name}</strong>
                                        <span>{r.courier_service_name} • {r.duration}</span>
                                    </div>
                                    <div className={styles.priceBox}>
                                        <div className={styles.price}>
                                            Rp {r.price.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dashboard / Shipment List */}
                <div className={styles.card}>
                    <h3><Package size={18} /> Recent Shipments</h3>
                    
                    {isLoadingShipments ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 1rem' }} />
                            Loading shipments...
                        </div>
                    ) : shipments.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            No shipments found for this store yet.
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Courier</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shipments.map(s => (
                                        <tr key={s.id}>
                                            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <strong>{s.receiverName}</strong><br/>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.receiverPhone}</span>
                                            </td>
                                            <td>
                                                <strong style={{ textTransform: 'uppercase' }}>{s.courierCode}</strong><br/>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.serviceType}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}><MapPin size={12} style={{ display: 'inline', verticalAlign: '-2px' }}/> {s.senderCity || s.senderPostal}</span><br/>
                                                <span style={{ fontSize: '0.8rem' }}><MapPin size={12} style={{ display: 'inline', verticalAlign: '-2px', color: '#3b82f6' }}/> {s.receiverCity || s.receiverPostal}</span>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[mapStatus(s.status)]}`}>
                                                    {s.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                {s.waybillId ? (
                                                    <a 
                                                        href={`https://biteship.com/track/${s.waybillId}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                    >
                                                        <button className={styles.trackBtn}>Track</button>
                                                    </a>
                                                ) : <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>N/A</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Order Modal */}
            {selectedRate && (
                <div className={styles.modalOverlay} onClick={() => !isCreatingOrder && setSelectedRate(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Create Shipment Order</h2>
                            <button onClick={() => !isCreatingOrder && setSelectedRate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Selected Courier</div>
                            <div style={{ fontWeight: 600 }}>{selectedRate.courier_name} - {selectedRate.courier_service_name}</div>
                            <div style={{ color: '#10b981', fontWeight: 700, marginTop: '0.25rem' }}>Rp {selectedRate.price.toLocaleString('id-ID')}</div>
                        </div>

                        <form onSubmit={createOrder}>
                            <h4 style={{ fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '1rem' }}>Sender Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                    <label>Name</label>
                                    <input type="text" value={orderForm.senderName} onChange={e => setOrderForm({...orderForm, senderName: e.target.value})} required />
                                </div>
                                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                    <label>Phone</label>
                                    <input type="tel" value={orderForm.senderPhone} onChange={e => setOrderForm({...orderForm, senderPhone: e.target.value})} required />
                                </div>
                                <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                    <label>Full Address</label>
                                    <textarea value={orderForm.senderAddress} onChange={e => setOrderForm({...orderForm, senderAddress: e.target.value})} required rows={2} />
                                </div>
                            </div>

                            <h4 style={{ fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', margin: '1rem 0' }}>Receiver Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                    <label>Name</label>
                                    <input type="text" value={orderForm.receiverName} onChange={e => setOrderForm({...orderForm, receiverName: e.target.value})} required />
                                </div>
                                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                    <label>Phone</label>
                                    <input type="tel" value={orderForm.receiverPhone} onChange={e => setOrderForm({...orderForm, receiverPhone: e.target.value})} required />
                                </div>
                                <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                    <label>Full Address</label>
                                    <textarea value={orderForm.receiverAddress} onChange={e => setOrderForm({...orderForm, receiverAddress: e.target.value})} required rows={2} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setSelectedRate(null)} disabled={isCreatingOrder}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btn} disabled={isCreatingOrder}>
                                    {isCreatingOrder ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : 'Confirm & Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
