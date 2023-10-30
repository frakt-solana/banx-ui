import { FC } from 'react'

import classNames from 'classnames'
import { isFunction } from 'lodash'

import { StatInfo } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/core'
import { getDecimalPlaces } from '@banx/utils'

import { ADDITIONAL_MARKET_INFO, MAIN_MARKET_INFO } from './constants'

import styles from './MarketOverviewInfo.module.less'

export const MarketMainInfo: FC<{ market: MarketPreview }> = ({ market }) => {
  return (
    <div className={styles.mainInfoContainer}>
      <img src={market.collectionImage} className={styles.collectionImage} />
      <div className={styles.mainInfoContent}>
        <h4 className={styles.collectionName}>{market.collectionName}</h4>
        <div className={styles.mainInfoStats}>
          {MAIN_MARKET_INFO.map((statInfo) => {
            const { key, ...rest } = statInfo
            const value = market[key as keyof MarketPreview] as string
            const decimalPlaces = getDecimalPlaces(parseFloat(value) / 1e9)

            return <StatInfo key={key} value={value} {...rest} decimalPlaces={decimalPlaces} />
          })}
        </div>
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: MarketPreview
  isCardOpen: boolean
}

export const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isCardOpen }) => (
  <div className={classNames(styles.additionalInfoStats, { [styles.hidden]: isCardOpen })}>
    {ADDITIONAL_MARKET_INFO.map((statInfo) => {
      const { key, secondValue, valueRenderer, valueStyles, ...rest } = statInfo
      const value = market[key as keyof MarketPreview] as number
      const computedSecondValue = isFunction(secondValue) ? secondValue(market) : secondValue

      const computedValue = valueRenderer ? valueRenderer(value) : value
      const styles = isFunction(valueStyles) ? valueStyles(market) : valueStyles

      return (
        <StatInfo
          key={key}
          value={computedValue}
          secondValue={computedSecondValue}
          valueStyles={styles}
          {...rest}
        />
      )
    })}
  </div>
)
