import { FC } from 'react'

import { InstantLendTable } from './InstantLendTable'

interface InstantLoansContentProps {
  goToPlaceOfferTab: () => void
}

const InstantLoansContent: FC<InstantLoansContentProps> = ({ goToPlaceOfferTab }) => {
  return <InstantLendTable goToPlaceOfferTab={goToPlaceOfferTab} />
}

export default InstantLoansContent
