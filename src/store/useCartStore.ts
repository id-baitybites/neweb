import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    productId: string
    name: string
    price: number
    quantity: number
    imageUrl: string | null
    customization?: {
        flavor: string
        size: string
        topping: string
        message: string
        imageRef?: string
    }
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string | number) => void
    updateQuantity: (id: string | number, quantity: number) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const existingItem = get().items.find(i => i.productId === item.productId && JSON.stringify(i.customization) === JSON.stringify(item.customization))
                if (existingItem) {
                    set({
                        items: get().items.map(i =>
                            i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i
                        )
                    })
                } else {
                    set({ items: [...get().items, item] })
                }
            },
            removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
            updateQuantity: (id, quantity) => set({
                items: get().items.map(i => i.id === id ? { ...i, quantity } : i)
            }),
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
        }),
        {
            name: 'baitybites-cart',
        }
    )
)
