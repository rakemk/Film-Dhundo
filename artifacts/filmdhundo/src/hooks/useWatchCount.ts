import { useState, useEffect } from 'react'

export function useWatchCount() {
  const getTodayKey = () =>
    'watchCount_' + new Date().toDateString()

  const [count, setCount] = useState(() => {
    return parseInt(localStorage.getItem(getTodayKey()) || '0')
  })

  const increment = () => {
    const key = getTodayKey()
    const next = count + 1
    setCount(next)
    localStorage.setItem(key, String(next))
  }

  const shouldShowAffiliate = count >= 3

  useEffect(() => {
    const key = getTodayKey()
    const handler = () => setCount(parseInt(localStorage.getItem(key) || '0'))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return { count, increment, shouldShowAffiliate }
}
