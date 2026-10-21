import { useState } from 'react'
import vendors from './data/vendors.js'
import Header from './components/Header.jsx'
import VendorCard from './components/VendorCard.jsx'
import MenuList from './components/MenuList.jsx'
import Footer from './components/Footer.jsx'

function App() {
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0].id)
  const selectedVendor = vendors.find((v) => v.id === selectedVendorId)
  const [cart, setCart] = useState([])

  function handleAddToCart(item) {
    setCart((prevCart) => [...prevCart, item])   // a NEW array, never cart.push()
  }

  return (
    <>
      <Header cartCount={cart.length} />
      <main className="container">
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
      </main>
      <Footer />
    </>
  )
}

export default App
