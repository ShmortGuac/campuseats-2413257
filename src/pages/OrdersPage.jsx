import { Link } from 'react-router'
import { useCart } from '../hooks/useCart.js'

function OrdersPage() {
  const { orders } = useCart()

  if (orders.length === 0) {
    return (
      <section>
        <h2 className="section-title">My orders</h2>
        <p className="muted">You have not placed any orders yet.</p>
        <Link to="/">Browse vendors</Link>
      </section>
    )
  }

  const newestFirst = [...orders].reverse()

  return (
    <section>
      <h2 className="section-title">My orders</h2>
      <ul className="order-list">
        {newestFirst.map((order) => (
          <li key={order.id} className="card order">
            <h3>Order #{order.id}</h3>
            <p className="muted">Placed on {new Date(order.date).toLocaleString()}</p>
            <p>
              {order.name}, Mahallah {order.mahallah}. Pick up your order at {order.pickupTime}.
            </p>
            <ul>
              {order.lines.map((line) => (
                <li key={line.item.id}>
                  {line.qty} × {line.item.name}
                  {line.note && line.note.trim() !== '' && (
                    <p className="order-note">Note: {line.note}</p>
                  )}
                </li>
              ))}
            </ul>
            <p className="price">Total: RM {order.total.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default OrdersPage
