import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'

import { BorrowNft, MarketPreview, Offer } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'
import { useTokenType } from '@banx/store'

import { BorrowCard, MarketCard } from '../../Card'

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
  const { tokenType } = useTokenType()

  const { data: nftsData, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: nfts })

  return (
    <>
      {connected && !nfts.length && (
        <EmptyList className={styles.emptyList} message="You don’t have any suitable NFTs" />
      )}

      <div className={styles.cardsList}>
        {connected &&
          nftsData.map((nft) => (
            <BorrowCard
              key={nft.mint}
              nft={nft}
              onClick={() => borrow(nft)}
              findBestOffer={findBestOffer}
              tokenType={tokenType}
            />
          ))}

        {!connected &&
          marketsPreview.map((market) => (
            <MarketCard key={market.marketPubkey} market={market} onClick={goToBorrowPage} />
          ))}
      </div>
      <div ref={fetchMoreTrigger} />
    </>
  )
}

export default CardsList
