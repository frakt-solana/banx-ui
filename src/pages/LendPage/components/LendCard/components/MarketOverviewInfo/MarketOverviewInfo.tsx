import { CSSProperties, FC } from 'react'

import { isFunction } from 'lodash'

import { StatInfo } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/bonds'

import { ADDITIONAL_MARKET_INFO, MAIN_MARKET_INFO } from './constants'

import styles from './MarketOverviewInfo.module.less'

export const MarketMainInfo: FC<{ market: MarketPreview }> = ({ market }) => {
  console.log(market)
  return (
    <div className={styles.mainInfoContainer}>
      <img src={market.collectionImage} className={styles.collectionImage} />
      <div className={styles.mainInfoContent}>
        <h4 className={styles.collectionName}>{market.collectionName}</h4>
        <div className={styles.mainInfoStats}>
          {MAIN_MARKET_INFO.map((statInfo) => {
            const { key, ...rest } = statInfo
            const value = market[key as keyof MarketPreview] as string

            return <StatInfo key={key} value={value} {...rest} />
          })}
        </div>
      </div>
    </div>
  )
}

export const MarketAdditionalInfo: FC<{ market: MarketPreview }> = ({ market }) => (
  <div className={styles.additionalInfoStats}>
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
