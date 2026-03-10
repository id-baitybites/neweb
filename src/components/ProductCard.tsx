'use client'

import Link from 'next/link'
import styles from '@/styles/modules/Home.module.scss'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { toast } from 'sonner'

interface ProductProps {
    product: {
        id: string
        name: string
        price: number
        description: string
        imageUrl: string | null
    }
}

export default function ProductCard({ product }: ProductProps) {
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        addItem({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl,
        })
        toast.success(`${product.name} ditambahkan ke keranjang!`)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <Link href={`/product/${product.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                ) : (
                    <div className={styles.placeholder}>No Image</div>
                )}
            </div>
            <div className={styles.content}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className={styles.footer}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                    <button
                        onClick={handleAddToCart}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <ShoppingCart size={16} /> +
                    </button>
                </div>
            </div>
        </Link>
    )
}
