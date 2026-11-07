import { CartContext } from './cart-context.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

function CartProvider({ children }) {
  const [cart, setCart] = useLocalStorage('campuseats-cart', [])
  const [orders, setOrders] = useLocalStorage('campuseats-orders', [])

  let count = 0
  let total = 0
  for (const line of cart) {
    count = count + line.qty
    total = total + line.item.price * line.qty
  }

  function addToCart(item) {
    const existing = cart.find((line) => line.item.id === item.id)
    if (existing) {
      const newCart = cart.map((line) => {
        if (line.item.id === item.id) {
          return { ...line, qty: line.qty + 1 }
        }
        return line
      })
      setCart(newCart)
    } else {
      setCart([...cart, { item: item, qty: 1, note: '' }])
    }
  }

  function changeQty(itemId, amount) {
    const newCart = cart.map((line) => {
      if (line.item.id === itemId) {
        return { ...line, qty: line.qty + amount }
      }
      return line
    })
    setCart(newCart.filter((line) => line.qty > 0))
  }

  function changeNote(itemId, note) {
    const newCart = cart.map((line) => {
      if (line.item.id === itemId) {
        return { ...line, note: note }
      }
      return line
    })
    setCart(newCart)
  }

  function removeFromCart(itemId) {
    setCart(cart.filter((line) => line.item.id !== itemId))
  }

  function placeOrder(details) {
    const newOrder = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: details.name,
      mahallah: details.mahallah,
      pickupTime: details.pickupTime,
      lines: cart,
      total: total,
    }
    setOrders([...orders, newOrder])
    setCart([])
  }

  const value = {
    cart,
    orders,
    count,
    total,
    addToCart,
    changeQty,
    changeNote,
    removeFromCart,
    placeOrder,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartProvider
