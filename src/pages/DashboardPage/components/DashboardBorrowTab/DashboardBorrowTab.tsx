import { Loader } from '@banx/components/Loader'

import { BorrowNft, MarketPreview } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'
import { calculateLoanValue } from '@banx/utils'

import { BorrowCard } from '../Card'
import { SearchableHeading } from '../components'
import { AvailableToBorrow, MyLoans } from './components'
import { calcDailyInterestFee } from './helpers'
import { useDashboardBorrowTab } from './hooks'

import styles from './DashboardBorrowTab.module.less'

const DashboardBorrowTab = () => {
  const {
    marketsPreview,
    nfts,
    searchSelectParams,
    borrowerStats,
    borrow,
    findBestOffer,
    goToBorrowPage,
    headingText,
    isConnected,
    loading,
  } = useDashboardBorrowTab()

  const { data: nftsData, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: nfts })

  const createNFTCard = (borrowNft: BorrowNft) => {
    const { mint, nft, loan } = borrowNft

    const dailyFee = calcDailyInterestFee({
      apr: loan.marketApr,
      collectionFloor: nft.collectionFloor,
    })

    const bestOffer = findBestOffer(loan.marketPubkey)
    const bestLoanValue = bestOffer ? calculateLoanValue(bestOffer) : 0

    return (
      <BorrowCard
        key={mint}
        onClick={() => borrow(borrowNft)}
        image={nft.meta.imageUrl}
        dailyFee={dailyFee}
        maxBorrow={bestLoanValue}
      />
    )
  }

  const createMarketCard = (market: MarketPreview) => (
    <BorrowCard
      key={market.marketPubkey}
      image={market.collectionImage}
      maxBorrow={market.bestOffer}
      onClick={goToBorrowPage}
      dailyFee={calcDailyInterestFee({
        apr: market.marketApr,
        collectionFloor: market.collectionFloor,
      })}
    />
  )

  return (
    <>
      <div className={styles.nftsSection}>
        <SearchableHeading title={headingText} searchSelectParams={searchSelectParams} />
        {loading ? (
          <Loader />
        ) : (
          <div className={styles.cardsList}>
            {isConnected ? nftsData.map(createNFTCard) : marketsPreview.map(createMarketCard)}
          </div>
        )}
        <div ref={fetchMoreTrigger} />
      </div>
      <div className={styles.additionalContentSection}>
        <AvailableToBorrow />
        {isConnected && <MyLoans stats={borrowerStats} />}
      </div>
    </>
  )
}

export default DashboardBorrowTab
