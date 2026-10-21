// One row in the cart. It shows data and reports clicks upward; it owns no state.
function CartItem({ line, onChangeQty, onRemove }) {
  const { item, qty } = line
  return (
    <li className="cart-line">
      <div>
        <p className="cart-name">{item.name}</p>
        <p className="muted">RM {item.price.toFixed(2)} each</p>
      </div>
      <div className="qty">
        <button type="button" onClick={() => onChangeQty(item.id, -1)}>−</button>
        <span>{qty}</span>
        <button type="button" onClick={() => onChangeQty(item.id, 1)}>+</button>
      </div>
      <p className="line-total">RM {(item.price * qty).toFixed(2)}</p>
      <button type="button" className="link danger" onClick={() => onRemove(item.id)}>Remove</button>
    </li>
  )
}

export default CartItem
