'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import styles from '@/styles/modules/ProductDetail.module.scss'
import { Product } from '@prisma/client'

interface Props {
    product: Product
}

export default function ProductDetailClient({ product }: Props) {
    const addItem = useCartStore((state) => state.addItem)
    const [quantity, setQuantity] = useState(1)
    const [customization, setCustomization] = useState({
        flavor: 'Original',
        size: 'Medium (18cm)',
        topping: 'None',
        message: '',
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const handleAddToCart = () => {
        addItem({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            imageUrl: product.imageUrl,
            customization: {
                ...customization,
                imageRef: undefined
            }
        })
        toast.success(`${product.name} ditambahkan ke keranjang!`)
    }

    return (
        <div className={styles.productDetail}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.imageWrapper}>
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                        ) : (
                            <div style={{ height: 400, background: '#eee' }}>No Image</div>
                        )}
                    </div>

                    <div className={styles.info}>
                        <h1>{product.name}</h1>
                        <span className={styles.price}>{formatPrice(product.price)}</span>
                        <p className={styles.description}>{product.description}</p>

                        <div className={styles.customization}>
                            <h3>Kustomisasi Kue</h3>

                            <div className={styles.formGroup}>
                                <label>Varian Rasa</label>
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
                                <label>Ukuran</label>
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
                                <label>Topping Tambahan</label>
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
                                <label>Pesan di Atas Kue (Opsional)</label>
                                <textarea
                                    placeholder="Contoh: Happy Birthday Budi!"
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

                                <button onClick={handleAddToCart} className={`${styles.addButton} btn-primary`}>
                                    <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} />
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
