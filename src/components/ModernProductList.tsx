'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, MoreVertical } from 'lucide-react'
import styles from '@/styles/modules/ModernProducts.module.scss'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import Link from 'next/link'

interface Product {
    id: string
    tenantId: string
    name: string
    price: number
    description: string
    category: string | null
    imageUrl: string | null
}

interface ModernProductListProps {
    products: Product[]
    dictionary: any
    tenant: any
}

export default function ModernProductList({ products, dictionary, tenant }: ModernProductListProps) {
    const t = dictionary.cart
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>(t.all)
    const { items, addItem, removeItem, updateQuantity, getTenantItems, totalItems, totalPrice } = useCartStore()
    const [deliveryType, setDeliveryType] = useState(t.delivery)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const categories = [t.all, ...Array.from(new Set(products.map(p => p.category || 'Other').filter(Boolean)))]

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === t.all || (p.category || 'Other') === activeCategory
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const tenantItems = mounted ? getTenantItems(tenant.id) : []
    const subtotal = mounted ? totalPrice(tenant.id) : 0
    const discount = 0
    const total = subtotal - discount

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.mainContent}>
                <div className={styles.topBar}>
                    <div className={styles.search}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.categories}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={activeCategory === cat ? styles.active : ''}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <h2 className={styles.menuHeader}>
                    {activeCategory === t.all ? t.menu : `${activeCategory} menu`}
                </h2>

                <div className={styles.productGrid}>
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAdd={addItem} t={t} tenantId={tenant.id} />
                    ))}

                    {filteredProducts.length === 0 && (
                        <div style={{ color: '#A0AEC0', padding: '2rem 0' }}>
                            {t.empty}
                        </div>
                    )}
                </div>
            </div>

            <aside className={styles.cartSidebar}>
                <div className={styles.cartHeader}>
                    <h2>{t.title}</h2>
                    <span className={styles.orderNo}>Daftar Pesanan</span>
                </div>

                <div className={styles.deliveryOptions}>
                    {[t.delivery, t.dine_in, t.take_away].map(type => (
                        <button
                            key={type}
                            className={deliveryType === type ? styles.active : ''}
                            onClick={() => setDeliveryType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className={styles.cartItems}>
                    {mounted && tenantItems.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#A0AEC0', marginTop: '2rem' }}>
                            {t.empty}
                        </div>
                    )}
                    {mounted && tenantItems.map(item => (
                        <div key={item.id} className={styles.cartItem}>
                            <div className={styles.itemImage}>
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div style={{ fontSize: '0.6rem', color: '#A0AEC0' }}>No img</div>}
                            </div>
                            <div className={styles.itemDetails}>
                                <div className={styles.name}>{item.name.replace(/\(.*\)/, '')}</div>
                                <div className={styles.meta}>{item.name.match(/\((.*)\)/)?.[1] || (dictionary.locale === 'id' ? 'Reguler' : 'Regular')}</div>

                                <div className={styles.itemActions}>
                                    <div className={styles.price}>{formatPrice(item.price)}</div>
                                    <div className={styles.qtyControl}>
                                        <button onClick={() => {
                                            if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1)
                                            else removeItem(item.id)
                                        }}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.summary}>
                    <div className={styles.row}>
                        <span>{t.items}</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className={styles.row}>
                        <span>{t.discounts}</span>
                        <span>-{formatPrice(discount)}</span>
                    </div>
                    <div className={`${styles.row} ${styles.total}`}>
                        <span>{t.total}</span>
                        <span className={styles.totalPrice}>{formatPrice(total)}</span>
                    </div>

                    <Link href="/checkout" style={{ textDecoration: 'none' }}>
                        <button className={styles.checkoutBtn} disabled={tenantItems.length === 0}>
                            {t.checkout}
                        </button>
                    </Link>
                </div>
            </aside>
        </div>
    )
}

function ProductCard({ product, onAdd, t, tenantId }: { product: Product, onAdd: any, t: any, tenantId: string }) {
    const [qty, setQty] = useState(1)
    const [size, setSize] = useState(t.small)
    const [isAdded, setIsAdded] = useState(false)

    const handleAdd = () => {
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            tenantId,
            name: `${product.name} (${size})`,
            price: product.price,
            quantity: qty,
            imageUrl: product.imageUrl,
        })
        setIsAdded(true)
        toast.success(`${qty}x ${product.name} ${t.added}!`)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                ) : (
                    <div className={styles.placeholder}>No image</div>
                )}
            </div>

            <div className={styles.details}>
                <div className={styles.header}>
                    <h3>{product.name}</h3>
                    <div className={styles.price}>{formatPrice(product.price)}</div>
                </div>

                <p className={styles.description}>
                    {product.description || 'This item has a delicious taste.'}
                </p>

                <div className={styles.options}>
                    <span>{t.size}</span>
                    <div className={styles.sizeToggle}>
                        <button className={size === t.small ? styles.active : ''} onClick={() => setSize(t.small)}>{t.small}</button>
                        <button className={size === t.large ? styles.active : ''} onClick={() => setSize(t.large)}>{t.large}</button>
                    </div>
                </div>

                <div className={styles.actions}>
                    <div className={styles.quantity}>
                        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(qty + 1)}>+</button>
                    </div>

                    <button
                        className={`${styles.addBtn} ${isAdded ? styles.added : ''}`}
                        onClick={handleAdd}
                    >
                        {isAdded ? t.added : t.add_to_cart}
                    </button>
                </div>
            </div>
        </div>
    )
}
