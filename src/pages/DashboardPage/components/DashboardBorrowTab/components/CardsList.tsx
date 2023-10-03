import { FC, useMemo } from 'react'

import { BorrowNft, MarketPreview, Offer } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'
import { calculateLoanValue } from '@banx/utils'

import { BorrowCard } from '../../Card'
import { calcDailyInterestFee } from '../helpers'
import { useDashboardBorrowTab } from '../hooks'

import styles from '../DashboardBorrowTab.module.less'

const CardsList = () => {
  const { marketsPreview, nfts, borrow, findBestOffer, goToBorrowPage, isConnected } =
    useDashboardBorrowTab()

  const { data: nftsData, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: nfts })

  return (
    <>
      <div className={styles.cardsList}>
        {isConnected &&
          nftsData.map((nft) => (
            <NFTCard key={nft.mint} borrowNft={nft} borrow={borrow} findBestOffer={findBestOffer} />
          ))}

        {!isConnected &&
          marketsPreview.map((market) => (
            <MarketCard key={market.marketPubkey} market={market} goToBorrowPage={goToBorrowPage} />
          ))}
      </div>
      <div ref={fetchMoreTrigger} />
    </>
  )
}

export default CardsList

interface NFTCardProps {
  borrowNft: BorrowNft
  borrow: (nft: BorrowNft) => void
  findBestOffer: (marketPubkey: string) => Offer | null
}
const NFTCard: FC<NFTCardProps> = ({ borrowNft, borrow, findBestOffer }) => {
  const { mint, nft, loan } = borrowNft

  const dailyFee = calcDailyInterestFee({
    apr: loan.marketApr,
    collectionFloor: nft.collectionFloor,
  })

  const bestOffer = useMemo(
    () => findBestOffer(loan.marketPubkey),
    [findBestOffer, loan.marketPubkey],
  )
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

interface MarketCardProps {
  market: MarketPreview
  goToBorrowPage: () => void
}
const MarketCard: FC<MarketCardProps> = ({ market, goToBorrowPage }) => (
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
