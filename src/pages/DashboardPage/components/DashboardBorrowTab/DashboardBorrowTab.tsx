import { BorrowNft, MarketPreview } from '@banx/api/core'

import { BorrowCard } from '../Card'
import { SearchableHeading } from '../components'
import AvailableToBorrow from './AvailableToBorrow'
import MyLoans from './MyLoans'
import { useDashboardBorrowTab } from './hooks'

import styles from './DashboardBorrowTab.module.less'

const DashboardBorrowTab = () => {
  const {
    marketsPreview,
    nfts,
    headingText,
    connected,
    showMyLoans,
    marketsTotalStats,
    nftsTotalStats,
    searchSelectParams,
  } = useDashboardBorrowTab()

  const createNFTCard = (nft: BorrowNft) => (
    <BorrowCard key={nft.mint} image={nft.nft.meta.imageUrl} dailyFee={10} />
  )

  const createMarketCard = (market: MarketPreview) => (
    <BorrowCard
      key={market.marketPubkey}
      image={market.collectionImage}
      maxAvailableToBorrow={market.bestOffer}
      dailyFee={10}
    />
  )

  return (
    <>
      <div className={styles.nftsSection}>
        <SearchableHeading title={headingText} searchSelectParams={searchSelectParams as any} />
        <div className={styles.cardsList}>
          {connected ? nfts.map(createNFTCard) : marketsPreview.map(createMarketCard)}
        </div>
      </div>
      <div className={styles.additionalContentSection}>
        <AvailableToBorrow {...marketsTotalStats} {...nftsTotalStats} />
        {showMyLoans && <MyLoans />}
      </div>
    </>
  )
}

export default DashboardBorrowTab
