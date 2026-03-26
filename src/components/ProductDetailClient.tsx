'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import styles from '@/styles/modules/ProductDetail.module.scss'
import { Product } from '@prisma/client'
import { getSafeCurrency } from '@/lib/config'

interface Props {
    product: Product
    tenant: any
    dict: any
}

export default function ProductDetailClient({ product, tenant, dict }: Props) {
    const t = dict.product_detail
    const addItem = useCartStore((state) => state.addItem)
    const [quantity, setQuantity] = useState(1)
    const [customization, setCustomization] = useState({
        flavor: 'Original',
        size: 'Medium (18cm)',
        topping: 'None',
        message: '',
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(dict.locale === 'id' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: getSafeCurrency(tenant.config.currency),
            minimumFractionDigits: 0,
        }).format(price)
    }

    const handleAddToCart = () => {
        addItem({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            tenantId: product.tenantId,
            name: product.name,
            price: product.price,
            quantity: quantity,
            imageUrl: product.imageUrl,
            customization: {
                ...customization,
                imageRef: undefined
            }
        })
        toast.success(t.added_toast.replace('{name}', product.name))
    }

    return (
        <div className={styles.productDetail}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.imageWrapper}>
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                        ) : (
                            <div style={{ height: 400, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {t.no_image}
                            </div>
                        )}
                    </div>

                    <div className={styles.info}>
                        <h1>{product.name}</h1>
                        <span className={styles.price}>{formatPrice(product.price)}</span>
                        <p className={styles.description}>{product.description}</p>

                        <div className={styles.customization}>
                            <h3 style={{ color: tenant.theme.primary }}>{t.customize}</h3>

                            <div className={styles.formGroup}>
                                <label>{t.flavor}</label>
                                <select
                                    value={customization.flavor}
                                    onChange={(e) => setCustomization({ ...customization, flavor: e.target.value })}
                                >
                                    <option>Original</option>
                                    <option>Chocolate Velvet</option>
                                    <option>Cheese Delight</option>
                                    <option>Fruit Mix</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>{t.size}</label>
                                <select
                                    value={customization.size}
                                    onChange={(e) => setCustomization({ ...customization, size: e.target.value })}
                                >
                                    <option>Small (15cm)</option>
                                    <option>Medium (18cm)</option>
                                    <option>Large (22cm)</option>
                                    <option>Extra Large (25cm)</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>{t.topping}</label>
                                <select
                                    value={customization.topping}
                                    onChange={(e) => setCustomization({ ...customization, topping: e.target.value })}
                                >
                                    <option>None</option>
                                    <option>Extra Cheese</option>
                                    <option>Chocolate Chips</option>
                                    <option>Fresh Fruits</option>
                                    <option>Oreo Crumbs</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>{t.message}</label>
                                <textarea
                                    placeholder={t.message_placeholder}
                                    value={customization.message}
                                    onChange={(e) => setCustomization({ ...customization, message: e.target.value })}
                                />
                            </div>

                            <div className={styles.actions}>
                                <div className={styles.quantity}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Minus size={16} />
                                    </button>
                                    <input type="text" readOnly value={quantity} />
                                    <button onClick={() => setQuantity(quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button 
                                    onClick={handleAddToCart} 
                                    className={`${styles.addButton} btn-primary`}
                                    style={{ background: tenant.theme.primary }}
                                >
                                    <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
                                    {t.add_to_cart}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
