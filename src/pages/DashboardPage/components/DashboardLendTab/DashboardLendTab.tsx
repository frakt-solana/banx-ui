import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import { LendCard } from '../Card'
import SearchableHeading from '../SearchableHeading'
import AllocationBlock from './components/AllocationBlock/AllocationBlock'
import NotConnectedContent from './components/NotConnectedContent'

import styles from './DashboardLendTab.module.less'

const DashboardLendTab = () => {
  const { connected } = useWallet()
  const { marketsPreview } = useMarketsPreview()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
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

  return (
    <>
      {!connected && (
        <>
          <SearchableHeading title="Collections" searchSelectParams={searchSelectParams as any} />
          <NotConnectedContent />
        </>
      )}
      {connected && (
        <div className={styles.container}>
          <div className={styles.leftSide}>
            <SearchableHeading title="Collections" searchSelectParams={searchSelectParams as any} />
            <div className={styles.cardList}>
              {marketsPreview.map((market) => (
                <LendCard
                  key={market.marketPubkey}
                  image={market.collectionImage}
                  amountOfLoans={market.activeBondsAmount}
                  offerTvl={market.offerTvl}
                  apy={market.marketApr}
                />
              ))}
            </div>
          </div>
          <div className={styles.rightSide}>
            <AllocationBlock />
          </div>
        </div>
      )}
    </>
  )
}

export default DashboardLendTab
