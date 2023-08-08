import { useState } from 'react'

export const useOrderBookLite = () => {
  const [openOffersMobile, setOpenOffersMobile] = useState<boolean>(true)

  const toggleOffers = () => {
    setOpenOffersMobile((prev) => !prev)
  }

  return {
    openOffersMobile,
    toggleOffers,
  }
}
