import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export const FREE_SHIPPING_THRESHOLD = 50.00;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('perfumezone_cart')) || [];
    } catch {
      return [];
    }
  });

  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('perfumezone_coupon')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('perfumezone_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('perfumezone_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('perfumezone_coupon');
    }
  }, [coupon]);

  const add = (p, qty = 1) => {
    setItems((curr) => {
      const exists = curr.find((i) => i.id === p.id);
      if (exists) {
        return curr.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...curr,
        {
          id: p.id,
          handle: p.handle,
          title: p.title,
          brand: p.brand || 'Perfume Zone',
          size: p.size || '100ml',
          price: Number(p.price),
          image: p.image_url || '',
          qty
        }
      ];
    });
    setOpen(true);
  };

  const setQty = (id, qty) => {
    setItems((curr) =>
      curr.map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i)).filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => {
    setItems((curr) => curr.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('perfumezone_cart');
    localStorage.removeItem('perfumezone_coupon');
  };

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);

  // Discount calculation
  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percent') {
      discount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discount = Math.min(subtotal, coupon.value);
    }
  }

  const applyCoupon = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'PERFUME10' || clean === 'WELCOME10') {
      const c = { code: clean, type: 'percent', value: 10, label: '10% Off' };
      setCoupon(c);
      return { ok: true, message: 'Coupon applied! 10% discount.' };
    }
    if (clean === 'ZONE15') {
      const c = { code: clean, type: 'percent', value: 15, label: '15% VIP Off' };
      setCoupon(c);
      return { ok: true, message: 'VIP Coupon applied! 15% discount.' };
    }
    if (clean === 'FREESHIP') {
      const c = { code: clean, type: 'free_shipping', value: 0, label: 'Free Delivery' };
      setCoupon(c);
      return { ok: true, message: 'Free Shipping unlocked!' };
    }
    return { ok: false, message: 'Invalid discount code.' };
  };

  const removeCoupon = () => setCoupon(null);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.type === 'free_shipping' ? 0 : 3.99;
  const total = Math.max(0, subtotal - discount);

  return (
    <Ctx.Provider
      value={{
        items,
        add,
        setQty,
        removeItem,
        clearCart,
        count,
        subtotal,
        total,
        shippingCost,
        discount,
        coupon,
        applyCoupon,
        removeCoupon,
        open,
        setOpen,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
