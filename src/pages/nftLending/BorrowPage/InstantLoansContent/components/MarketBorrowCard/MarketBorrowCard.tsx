import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/nft'
import { ChevronDown } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { HealthColorIncreasing, getColorByPercent, getTokenDecimals } from '@banx/utils'

import { MarketBorrowCardExpandedContent } from '../MarketBorrowCardExpandedContent'

import styles from './MarketBorrowCard.module.less'

type MarketBorrowCardProps = {
  marketPreview: MarketPreview
  onClick: () => void
  isExpanded: boolean
  goToRequestLoanTab: () => void
}

export const MarketBorrowCard: FC<MarketBorrowCardProps> = ({
  marketPreview,
  onClick,
  isExpanded,
  goToRequestLoanTab,
}) => {
  const { collectionName, collectionImage } = marketPreview

  return (
    <div className={styles.card}>
      <div
        onClick={onClick}
        className={classNames(styles.cardBody, { [styles.expanded]: isExpanded })}
      >
        <div className={styles.mainInfoContainer}>
          <img src={collectionImage} className={styles.collateralImage} />
          <h4 className={styles.collateralName}>{collectionName}</h4>
        </div>

        <div className={styles.additionalContentWrapper}>
          <MarketBorrowCardInfo marketPreview={marketPreview} isExpanded={isExpanded} />

          <Button
            type="circle"
            size="medium"
            className={classNames(styles.expandButton, { [styles.expanded]: isExpanded })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <MarketBorrowCardExpandedContent
          preview={marketPreview}
          goToRequestLoanTab={goToRequestLoanTab}
        />
      )}
    </div>
  )
}

type MarketBorrowCardInfoProps = {
  marketPreview: MarketPreview
  isExpanded: boolean
}

const MarketBorrowCardInfo: FC<MarketBorrowCardInfoProps> = ({ marketPreview, isExpanded }) => {
  const { marketApr: marketAprBasePoints, offerTvl } = marketPreview

  const marketApr = marketAprBasePoints / 100

  const { tokenType } = useTokenType()
  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6

  const classNamesProps = {
    container: styles.infoStat,
    labelWrapper: styles.infoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.infoStats, { [styles.expanded]: isExpanded })}>
      <StatInfo
        label="Offer TVL"
        value={<DisplayValue value={offerTvl / marketTokenDecimals} isSubscriptFormat />}
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="APR"
        value={marketApr}
        valueStyles={{ color: getColorByPercent(marketApr, HealthColorIncreasing) }}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={classNamesProps}
      />
    </div>
  )
}
