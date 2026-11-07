import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <div className="card">
      <h2>404: Page not found</h2>
      <p className="muted">There is nothing at this address.</p>
      <Link to="/">Go back home</Link>
    </div>
  )
}

export default NotFoundPage
