import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useBorrowNfts } from '../hooks'
import BorrowTable from './components/BorrowTable'
import NotConnectedTable from './components/NotConnectedTable'

interface InstantLoansContentProps {
  goToRequestLoanTab: () => void
}

export const InstantLoansContent: FC<InstantLoansContentProps> = ({ goToRequestLoanTab }) => {
  const { connected } = useWallet()

  const { nfts, isLoading, rawOffers, maxLoanValueByMarket } = useBorrowNfts()

  const showEmptyList = !nfts?.length && !isLoading

  const showBorrowTable = connected && !showEmptyList

  return showBorrowTable ? (
    <BorrowTable
      nfts={nfts}
      isLoading={isLoading}
      rawOffers={rawOffers}
      maxLoanValueByMarket={maxLoanValueByMarket}
      goToRequestLoanTab={goToRequestLoanTab}
    />
  ) : (
    <NotConnectedTable />
  )
}
