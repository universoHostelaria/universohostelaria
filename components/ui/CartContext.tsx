'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Product } from '@/lib/supabase'

export type CartItem = {
  product: Product
  quantity: number
}

type CartCtx = {
  items:      CartItem[]
  isOpen:     boolean
  addItem:    (product: Product, qty: number) => void
  removeItem: (id: string) => void
  updateQty:  (id: string, qty: number) => void
  clearCart:  () => void
  openCart:   () => void
  closeCart:  () => void
  total:      number
  count:      number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items,  setItems]  = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Persist cart in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('uh_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('uh_cart', JSON.stringify(items)) } catch {}
  }, [items])

  const addItem = useCallback((product: Product, qty: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + qty } : i)
      }
      return [...prev, { product, quantity: qty }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.product.id !== id))
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const openCart  = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const total = items.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, isOpen, addItem, removeItem, updateQty,
      clearCart, openCart, closeCart, total, count
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
