import React from 'react'
import { prisma } from '@/lib/prisma'
import { AlertCircle, Plus, Edit, Trash2 } from 'lucide-react'
import { Inventory } from '@prisma/client'
import { getDictionary } from '@/i18n'
import { resolveTenant } from '@/lib/tenant'

export default async function InventoryPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()
    const t = dict.admin.inventory

    const materials = await prisma.inventory.findMany({
        where: { tenantId: tenant?.id },
        orderBy: { material: 'asc' }
    })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>{t.title}</h1>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> {t.add_material}
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1rem 2rem' }}>{t.th_material}</th>
                            <th style={{ padding: '1rem 2rem' }}>{t.th_stock}</th>
                            <th style={{ padding: '1rem 2rem' }}>{t.th_unit}</th>
                            <th style={{ padding: '1rem 2rem' }}>{t.th_status}</th>
                            <th style={{ padding: '1rem 2rem' }}>{t.th_actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((item: Inventory) => {
                            const isLow = item.quantity <= item.lowStockAlert
                            return (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem 2rem', fontWeight: 500 }}>{item.material}</td>
                                    <td style={{ padding: '1rem 2rem' }}>{item.quantity}</td>
                                    <td style={{ padding: '1rem 2rem' }}>{item.unit}</td>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        {isLow ? (
                                            <span style={{ color: '#F44336', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                                <AlertCircle size={14} /> {t.low_stock}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#4CAF50', fontSize: '0.85rem' }}>{t.safe_stock}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button style={{ color: '#2196F3' }}><Edit size={18} /></button>
                                            <button style={{ color: '#F44336' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {materials.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                        {t.no_data}
                    </div>
                )}
            </div>
        </div>
    )
}
