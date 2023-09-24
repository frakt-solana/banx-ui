import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { PATHS } from '@banx/router'
import { useMarketsURLControl } from '@banx/store'

import { LendCard } from '../../../Card'
import SearchableHeading from '../../../SearchableHeading'

import styles from './NotConnectedContent.module.less'

const NotConnectedContent = () => {
  const { marketsPreview } = useMarketsPreview()
  const { setSelectedMarkets, setMarketVisibility } = useMarketsURLControl()

  const navigate = useNavigate()

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

  const goToSelectedMarket = (collectionName: string) => {
    setMarketVisibility(collectionName, true)
    setSelectedMarkets([collectionName])

    return navigate({
      pathname: PATHS.LEND,
      search: `?opened=${collectionName}&collections=${collectionName}`,
    })
  }

  return (
    <div className={styles.container}>
      <SearchableHeading title="Collections" searchSelectParams={searchSelectParams as any} />
      <div className={styles.cardList}>
        {marketsPreview.map((market) => (
          <LendCard
            key={market.marketPubkey}
            image={market.collectionImage}
            amountOfLoans={market.activeBondsAmount}
            offerTvl={market.offerTvl}
            apy={market.marketApr}
            onClick={() => goToSelectedMarket(market.collectionName)}
          />
        ))}
      </div>
    </div>
  )
}

export default NotConnectedContent
