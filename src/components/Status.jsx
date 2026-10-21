// Small components for the loading and error states of fetched data.
export function Loading() {
  return (
    <div role="status" aria-label="Loading menus…">
      <div className="vendor-grid">
        {[1, 2].map((n) => (
          <div key={n} className="card skeleton skeleton-vendor" />
        ))}
      </div>
      <div className="grid skeleton-grid">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="card skeleton skeleton-menu" />
        ))}
      </div>
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card error" role="alert">
      <p>Could not load menus: {message}</p>
      <button className="btn" onClick={onRetry}>Try again</button>
    </div>
  )
}
