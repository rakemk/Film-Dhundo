import { useState, useEffect } from 'react'

export function useFamilySafe() {
  const [isFamilySafe, setIsFamilySafe] = useState(() => {
    return localStorage.getItem('familySafeMode') === 'true'
  })
  const toggle = () => {
    const next = !isFamilySafe
    setIsFamilySafe(next)
    localStorage.setItem('familySafeMode', String(next))
  }
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'familySafeMode') setIsFamilySafe(e.newValue === 'true')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  return { isFamilySafe, toggle }
}
