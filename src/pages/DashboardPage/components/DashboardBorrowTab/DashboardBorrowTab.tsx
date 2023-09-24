import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import { BorrowCard } from '../Card'
import { SearchableHeading } from '../SearchableHeading'
import AvailableToBorrow from './components/AvailableToBorrow'
import MyLoans from './components/MyLoans'

import styles from './DashboardBorrowTab.module.less'

const DashboardBorrowTab = () => {
  const { connected } = useWallet()
  const searchSelectParams = useSearchSelectParams()

  const headingText = connected ? 'Click to borrow' : '1 click loan'

  return (
    <div className={styles.container}>
      <div className={styles.nftsSection}>
        <SearchableHeading title={headingText} searchSelectParams={searchSelectParams as any} />
        <NFTsCardList />
      </div>
      <div className={styles.additionalContentSection}>
        <AvailableToBorrow />
        {connected && <MyLoans />}
      </div>
    </div>
  )
}

export default DashboardBorrowTab

const useSearchSelectParams = () => {
  const { marketsPreview } = useMarketsPreview()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  return {
    onChange: setSelectedOptions,
    options: marketsPreview,
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'offerTvl', format: (value: number) => createSolValueJSX(value, 1e9) },
    },
    labels: ['Collection', 'Offer Tvl'],
  }
}

export const NFTsCardList = () => {
  const { connected } = useWallet()

  const { marketsPreview } = useMarketsPreview()
  const { nfts } = useBorrowNfts()

  return (
    <div className={styles.collectionsCardList}>
      {connected ? (
        <>
          {nfts.map((nft) => (
            <BorrowCard
              key={nft.mint}
              image={nft.nft.meta.imageUrl}
              dailyFee={nft.loan.marketApr}
            />
          ))}
        </>
      ) : (
        <>
          {marketsPreview.map((market) => (
            <BorrowCard
              key={market.marketPubkey}
              image={market.collectionImage}
              maxAvailableToBorrow={market.bestOffer}
              dailyFee={10}
            />
          ))}
        </>
      )}
    </div>
  )
}
