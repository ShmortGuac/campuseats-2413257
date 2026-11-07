import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return initialValue
    } catch (err) {
      console.warn('Could not read ' + key + ' from localStorage', err)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn('Could not save ' + key + ' to localStorage', err)
    }
  }, [key, value])

  return [value, setValue]
}
