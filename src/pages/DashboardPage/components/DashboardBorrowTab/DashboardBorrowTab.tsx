import { useWallet } from '@solana/wallet-adapter-react'
import { find } from 'lodash'

import { BorrowNft, MarketPreview } from '@banx/api/core'
import { DAYS_IN_YEAR } from '@banx/constants'

import { BorrowCard } from '../Card'
import { SearchableHeading } from '../components'
import { AvailableToBorrow, MyLoans } from './components'
import { useDashboardBorrowTab } from './hooks'

import styles from './DashboardBorrowTab.module.less'

const DashboardBorrowTab = () => {
  const { connected } = useWallet()

  const { marketsPreview, nfts, searchSelectParams, borrowerStats, borrow } =
    useDashboardBorrowTab()

  const showMyLoans = connected && !!borrowerStats?.activeLoans
  const headingText = connected ? 'Click to borrow' : '1 click loan'

  const createNFTCard = (borrowNft: BorrowNft) => {
    const { mint, nft, loan } = borrowNft

    const currentMarket = find(marketsPreview, ['marketPubkey', loan.marketPubkey])
    const dailyFee = calcDailyInterestFee(loan.marketApr, nft.collectionFloor)

    return (
      <BorrowCard
        key={mint}
        onClick={() => borrow(borrowNft)}
        image={nft.meta.imageUrl}
        dailyFee={dailyFee}
        maxBorrow={currentMarket?.bestOffer}
      />
    )
  }

  const createMarketCard = (market: MarketPreview) => (
    <BorrowCard
      key={market.marketPubkey}
      image={market.collectionImage}
      maxBorrow={market.bestOffer}
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
        <AvailableToBorrow />
        {showMyLoans && <MyLoans stats={borrowerStats} />}
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
