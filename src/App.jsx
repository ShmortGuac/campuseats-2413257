import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import VendorCard from './components/VendorCard.jsx'
import MenuList from './components/MenuList.jsx'
import Footer from './components/Footer.jsx'
import CartPage from './components/CartPage.jsx'
import { Loading, ErrorMessage } from './components/Status.jsx'

function App() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedVendorId, setSelectedVendorId] = useState(null)
  const selectedVendor = vendors.find((v) => v.id === selectedVendorId)
  const [cart, setCart] = useState([])
  const [view, setView] = useState('menu')   // 'menu' | 'cart' | 'done'
  const [lastOrder, setLastOrder] = useState(null)
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/vendors.json', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setVendors(data)
        setSelectedVendorId(data[0].id) // select the first vendor once data arrives
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [reloadKey])

  function handleRetry() {
    setError(null)
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  function handleAddToCart(item) {
    setCart((prevCart) => {
      const existing = prevCart.find((line) => line.item.id === item.id)
      if (existing) {
        return prevCart.map((line) =>
          line.item.id === item.id ? { ...line, qty: line.qty + 1 } : line
        )
      }
      return [...prevCart, { item, qty: 1 }]   // a NEW array, never cart.push()
    })
  }

  function handleChangeQty(itemId, delta) {
    setCart((prevCart) =>
      prevCart
        .map((line) => (line.item.id === itemId ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    )
  }

  function handleRemove(itemId) {
    setCart((prevCart) => prevCart.filter((line) => line.item.id !== itemId))
  }

  function handlePlaceOrder(details) {
    const total = cart.reduce((sum, line) => sum + line.item.price * line.qty, 0)
    setLastOrder({ ...details, total })
    setCart([])
    setView('done')
  }

  let content
  if (view === 'cart') {
    content = (
      <CartPage cart={cart} onChangeQty={handleChangeQty}
                onRemove={handleRemove} onPlaceOrder={handlePlaceOrder} />
    )
  } else if (view === 'done') {
    content = (
      <div className="card">
        <h2>Order placed.</h2>
        <p>Thank you, {lastOrder.name}. Pick up your order at {lastOrder.pickupTime}.</p>
        <p className="price">Total: RM {lastOrder.total.toFixed(2)}</p>
      </div>
    )
  } else if (loading) {
    content = <Loading />
  } else if (error) {
    content = <ErrorMessage message={error} onRetry={handleRetry} />
  } else {
    content = (
      <>
        <section>
          <h2 className="section-title">Choose a vendor</h2>
          <div className="vendor-grid">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                isSelected={vendor.id === selectedVendorId}
                onSelect={setSelectedVendorId}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="section-title">Menu: {selectedVendor.name}</h2>
          <MenuList items={selectedVendor.menu} onAdd={handleAddToCart} />
        </section>
      </>
    )
  }

  return (
    <>
      <Header cartCount={cartCount}
              onShowMenu={() => setView('menu')} onShowCart={() => setView('cart')} />
      <main className="container">{content}</main>
      <Footer />
    </>
  )
}

export default App
