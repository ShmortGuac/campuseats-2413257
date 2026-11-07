import { useEffect, useState } from 'react'

export function useVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(() => {
      fetch('/api/vendors.json', { signal: controller.signal })
        .then((res) => {
          if (!res.ok) {
            throw new Error('HTTP ' + res.status)
          }
          return res.json()
        })
        .then((data) => {
          setVendors(data)
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setError(err.message)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        })
    }, 600)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [reloadKey])

  function reload() {
    setError(null)
    setLoading(true)
    setReloadKey(reloadKey + 1)
  }

  return { vendors, loading, error, reload }
}
