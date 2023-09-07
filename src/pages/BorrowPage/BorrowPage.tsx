import BorrowHeader from './components/BorrowHeader'
import BorrowTable from './components/BorrowTable'
import { useBorrowNfts } from './hooks'

import styles from './BorrowPage.module.less'

export const BorrowPage = () => {
  const { nfts, isLoading, rawOffers } = useBorrowNfts()

  return (
    <div className={styles.pageWrapper}>
      <BorrowHeader />
      <BorrowTable nfts={nfts} isLoading={isLoading} rawOffers={rawOffers} />
    </div>
  )
}
