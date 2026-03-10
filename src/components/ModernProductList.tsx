'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, MoreVertical } from 'lucide-react'
import styles from '@/styles/modules/ModernProducts.module.scss'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'
import Link from 'next/link'

interface Product {
    id: string
    name: string
    price: number
    description: string
    category: string | null
    imageUrl: string | null
}

interface ModernProductListProps {
    products: Product[]
}

export default function ModernProductList({ products }: ModernProductListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const { items, addItem, removeItem, updateQuantity } = useCartStore()
    const [deliveryType, setDeliveryType] = useState('Delivery')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Derive dynamic categories from products plus "All"
    const categories = ['All', ...Array.from(new Set(products.map(p => p.category || 'Other').filter(Boolean)))]

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || (p.category || 'Other') === activeCategory
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const discount = 0
    const total = subtotal - discount

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price / 15000)
    }

    return (
        <div className={styles.pageContainer}>
            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Top Bar Navigation */}
                <div className={styles.topBar}>
                    <div className={styles.search}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterBtn}>
                        <SlidersHorizontal size={18} /> Filter
                    </button>
                </div>

                {/* Categories */}
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
                    {activeCategory === 'All' ? 'Menu' : `${activeCategory} menu`}
                </h2>

                {/* Product Grid */}
                <div className={styles.productGrid}>
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAdd={addItem} />
                    ))}

                    {filteredProducts.length === 0 && (
                        <div style={{ color: '#A0AEC0', padding: '2rem 0' }}>
                            No products found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Aside Cart Panel */}
            <aside className={styles.cartSidebar}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" style={{ width: '100%', borderRadius: '50%' }} />
                    </div>
                    <div className={styles.details}>
                        <div className={styles.name}>Guest User</div>
                        <div className={styles.email}>guest@example.com</div>
                    </div>
                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#A0AEC0' }}>
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className={styles.cartHeader}>
                    <h2>Cart</h2>
                    <span className={styles.orderNo}>Order #3243</span>
                </div>

                <div className={styles.deliveryOptions}>
                    {['Delivery', 'Dine in', 'Take away'].map(type => (
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
                    {mounted && items.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#A0AEC0', marginTop: '2rem' }}>
                            Your cart is empty
                        </div>
                    )}
                    {mounted && items.map(item => (
                        <div key={item.id} className={styles.cartItem}>
                            <div className={styles.itemImage}>
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div style={{ fontSize: '0.6rem', color: '#A0AEC0' }}>No img</div>}
                            </div>
                            <div className={styles.itemDetails}>
                                <div className={styles.name}>{item.name.replace(/\(.*\)/, '')}</div>
                                <div className={styles.meta}>{item.name.match(/\((.*)\)/)?.[1] || 'Regular'} • 200g</div>

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
                        <span>Items</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className={styles.row}>
                        <span>Discounts</span>
                        <span>-{formatPrice(discount)}</span>
                    </div>
                    <div className={`${styles.row} ${styles.total}`}>
                        <span>Total</span>
                        <span className={styles.totalPrice}>{formatPrice(total)}</span>
                    </div>

                    <Link href="/checkout" style={{ textDecoration: 'none' }}>
                        <button className={styles.checkoutBtn}>
                            Place an order
                        </button>
                    </Link>
                </div>
            </aside>
        </div>
    )
}

function ProductCard({ product, onAdd }: { product: Product, onAdd: any }) {
    const [qty, setQty] = useState(1)
    const [size, setSize] = useState('Small')
    const [isAdded, setIsAdded] = useState(false)

    const handleAdd = () => {
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: `${product.name} (${size})`,
            price: product.price,
            quantity: qty,
            imageUrl: product.imageUrl,
        })
        setIsAdded(true)
        toast.success(`${qty}x ${product.name} added to cart!`)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price / 15000)
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
                    <span>Size</span>
                    <div className={styles.sizeToggle}>
                        <button className={size === 'Small' ? styles.active : ''} onClick={() => setSize('Small')}>Small</button>
                        <button className={size === 'Large' ? styles.active : ''} onClick={() => setSize('Large')}>Large</button>
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
                        {isAdded ? 'Added to cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    )
}
