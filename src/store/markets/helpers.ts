import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

type UseURLControl = (props: { key: string; data: string[]; storageKey: string }) => void

export const useURLControl: UseURLControl = ({ key, data, storageKey }) => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.delete(key)

    if (data.length > 0) {
      queryParams.append(key, data.join(','))
    }

    navigate({ search: queryParams.toString() })

    localStorage.setItem(storageKey, JSON.stringify({ [key]: data }))
  }, [navigate, location.search, data, key, storageKey])
}
