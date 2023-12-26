import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { BorrowNft, MarketPreview, Offer } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'
import { calculateLoanValue } from '@banx/utils'

import { BorrowCard } from '../../Card'
import { calcDailyInterestFee } from '../helpers'

import styles from '../DashboardBorrowTab.module.less'

interface CardsListProps {
  nfts: BorrowNft[]
  marketsPreview: MarketPreview[]
  borrow: (nft: BorrowNft) => void
  findBestOffer: (marketPubkey: string) => Offer | null
  goToBorrowPage: () => void
}

const CardsList: FC<CardsListProps> = ({
  nfts,
  marketsPreview,
  borrow,
  findBestOffer,
  goToBorrowPage,
}) => {
  const { connected } = useWallet()

  const { data: nftsData, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: nfts })

  return (
    <>
      <div className={styles.cardsList}>
        {connected &&
          nftsData.map((nft) => (
            <NFTCard key={nft.mint} borrowNft={nft} borrow={borrow} findBestOffer={findBestOffer} />
          ))}

        {!connected &&
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

  const bestLoanValue = useMemo(() => {
    const bestOffer = findBestOffer(loan.marketPubkey)
    if (!bestOffer) return 0

    return calculateLoanValue(bestOffer)
  }, [findBestOffer, loan.marketPubkey])

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
