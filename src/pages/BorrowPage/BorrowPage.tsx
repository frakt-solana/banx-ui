import { useWallet } from '@solana/wallet-adapter-react'

import { useOnboardingModal } from '@banx/hooks'
import { useMixpanelLocationTrack } from '@banx/utils'

import BorrowHeader from './components/BorrowHeader'
import BorrowTable from './components/BorrowTable'
import NotConnectedTable from './components/NotConnectedTable'
import { useBorrowNfts } from './hooks'

import styles from './BorrowPage.module.less'

export const BorrowPage = () => {
  useMixpanelLocationTrack('borrow')
  useOnboardingModal('borrow')

  const { connected } = useWallet()

  const { nfts, isLoading, rawOffers, maxLoanValueByMarket } = useBorrowNfts()

  const showEmptyList = !nfts?.length && !isLoading

  return (
    <div className={styles.pageWrapper}>
      <BorrowHeader />
      {connected && !showEmptyList ? (
        <BorrowTable
          nfts={nfts}
          isLoading={isLoading}
          rawOffers={rawOffers}
          maxLoanValueByMarket={maxLoanValueByMarket}
        />
      ) : (
        <NotConnectedTable />
      )}
    </div>
  )
}
