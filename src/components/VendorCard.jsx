function VendorCard() {
  const vendor = {
    name: 'John Eats',
    location: 'Mahallah Salahuddin',
    openHours: '6:00 am - 7:00 pm',
    isOpen: true,
  }

  return (
    <article className="card vendor-card">
      <div className="thumb" aria-hidden="true">
        {vendor.name.charAt(0)}
      </div>
      <div>
        <h2>{vendor.name}</h2>
        <p className="muted">{vendor.location}</p>
        <p className="muted">Open: {vendor.openHours}</p>
        <span className={vendor.isOpen ? 'status open' : 'status closed'}>
          {vendor.isOpen ? 'Open now' : 'Closed'}
        </span>
      </div>
    </article>
  )
}

export default VendorCard
