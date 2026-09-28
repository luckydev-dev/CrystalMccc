import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreProduct } from './DataContext';

export interface CartItem extends StoreProduct {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  toggleCart: () => void;
  addToCart: (product: StoreProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  discount: number;
  appliedPromoCode: string | null;
  applyPromoCode: (code: string, discountValue: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('crystalmc_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('crystalmc_cart', JSON.stringify(items));
  }, [items]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product: StoreProduct) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
    setAppliedPromoCode(null);
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const applyPromoCode = async (code: string, discountValue: number) => {
    setDiscount(discountValue);
    setAppliedPromoCode(code);
    return true;
  };

  return (
    <CartContext.Provider value={{ items, isCartOpen, toggleCart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, discount, appliedPromoCode, applyPromoCode }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
