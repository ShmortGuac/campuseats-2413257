const vendors = [
  {
    id: 'my-restaurant',
    name: 'John Eats',
    location: 'Mahallah Salahuddin',
    openHours: '6:00 am - 7:00 pm',
    isOpen: true,
    menu: [
      { id: 'my-1', name: 'John Lasagna', description: 'Baked layers of pasta, beef sauce and cheese', price: 12, category: 'Pasta', available: true },
      { id: 'my-2', name: 'John Burger', description: 'Beef patty, cheese, lettuce and tomato in a toasted bun', price: 10, category: 'Burger', available: true },
      { id: 'my-3', name: 'John Special', description: "The chef's special of the day", price: 15, category: 'Special', available: false },
    ],
  },
  {
    id: 'kafe-aminah',
    name: 'Kafe Mahallah Aminah',
    location: 'Mahallah Aminah, Ground Floor',
    openHours: '8:00 am - 9:00 pm',
    isOpen: true,
    menu: [
      { id: 'ami-1', name: 'Nasi Ayam Penyet', description: 'Smashed fried chicken with sambal and rice', price: 9, category: 'Rice', available: true },
      { id: 'ami-2', name: 'Air Bandung', description: 'Rose syrup with milk', price: 3, category: 'Drinks', available: true },
    ],
  },
]

export default vendors
