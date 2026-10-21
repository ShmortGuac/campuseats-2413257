import { useState } from 'react'

const MAHALLAHS = ['Ali', 'Aminah', 'Faruq', 'Asiah', 'Bilal', 'Hafsa', 'Uthman', 'Zubair']

// A plain function: values in, errors object out. Empty object = valid.
function validate(values) {
  const errors = {}
  if (values.name.trim().length < 3) errors.name = 'Enter your name (at least 3 characters).'
  if (!values.mahallah) errors.mahallah = 'Choose your mahallah.'
  if (!values.pickupTime) {
    errors.pickupTime = 'Choose a pickup time.'
  } else if (values.pickupTime < '07:00' || values.pickupTime > '22:00') {
    errors.pickupTime = 'Pickup time must be between 07:00 and 22:00.'
  }
  return errors
}

function CheckoutForm({ onPlaceOrder }) {
  const [values, setValues] = useState({ name: '', mahallah: '', pickupTime: '' })
  const [errors, setErrors] = useState({})

  // One handler for every input: the input's name matches a key in values.
  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()             // stop the page reloading
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length === 0) onPlaceOrder(values)
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h3>Checkout</h3>

      <label htmlFor="name">Name</label>
      <input id="name" name="name" value={values.name} onChange={handleChange} />
      {errors.name && <p className="field-error">{errors.name}</p>}

      <label htmlFor="mahallah">Mahallah</label>
      <select id="mahallah" name="mahallah" value={values.mahallah} onChange={handleChange}>
        <option value="">Select…</option>
        {MAHALLAHS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      {errors.mahallah && <p className="field-error">{errors.mahallah}</p>}

      <label htmlFor="pickupTime">Pickup time</label>
      <input id="pickupTime" type="time" name="pickupTime" value={values.pickupTime} onChange={handleChange} />
      {errors.pickupTime && <p className="field-error">{errors.pickupTime}</p>}

      <button type="submit" className="btn">Place order</button>
    </form>
  )
}

export default CheckoutForm
