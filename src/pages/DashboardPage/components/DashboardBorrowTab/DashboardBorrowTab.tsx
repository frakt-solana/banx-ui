import { find } from 'lodash'

import { BorrowNft, MarketPreview } from '@banx/api/core'
import { DAYS_IN_YEAR } from '@banx/constants'

import { BorrowCard } from '../Card'
import { SearchableHeading } from '../components'
import { AvailableToBorrow, MyLoans } from './components'
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

  const createNFTCard = (borrowNft: BorrowNft) => {
    const { mint, nft, loan } = borrowNft

    const currentMarket = find(marketsPreview, ['marketPubkey', loan.marketPubkey])
    const dailyFee = calcDailyInterestFee(loan.marketApr, nft.collectionFloor)

    return (
      <BorrowCard
        key={mint}
        onClick={() => {}}
        image={nft.meta.imageUrl}
        dailyFee={dailyFee}
        maxAvailableToBorrow={currentMarket?.bestOffer}
      />
    )
  }

  const createMarketCard = (market: MarketPreview) => (
    <BorrowCard
      key={market.marketPubkey}
      image={market.collectionImage}
      maxAvailableToBorrow={market.bestOffer}
      dailyFee={calcDailyInterestFee(market.marketApr, market.collectionFloor)}
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

const calcDailyInterestFee = (marketApr: number, collectionFloor: number) => {
  const aprInDecimal = marketApr / 1e4
  const dailyRate = aprInDecimal / DAYS_IN_YEAR
  const dailyFee = (dailyRate * collectionFloor) / 1e9

  return dailyFee
}
