import { Link, NavLink } from 'react-router'
import { useCart } from '../hooks/useCart.js'

function Header() {
  const { count } = useCart()

  return (
    <header className="header">
      <h1 className="logo">
        <Link to="/" className="logo-link">CampusEats</Link>
      </h1>
      <nav className="nav">
        <NavLink to="/" end>Vendors</NavLink>
        <NavLink to="/orders">My Orders</NavLink>
        <NavLink to="/cart" className="cart">
          Cart <span className="badge">{count}</span>
        </NavLink>
      </nav>
    </header>
  )
}

export default Header
