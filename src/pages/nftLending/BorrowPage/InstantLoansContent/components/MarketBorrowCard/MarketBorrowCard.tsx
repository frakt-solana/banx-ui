import { FC } from 'react'

import classNames from 'classnames'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'

import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { ChevronDown } from '@banx/icons'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import { MarketBorrowCardExpandedContent } from '../MarketBorrowCardExpandedContent'

import styles from './MarketBorrowCard.module.less'

type MarketBorrowCardProps = {
  marketPreview: MarketPreview
  maxLoanValue: number
  onClick: () => void
  isExpanded: boolean
  goToRequestLoanTab: () => void
  nftsAmount: number
}

export const MarketBorrowCard: FC<MarketBorrowCardProps> = ({
  marketPreview,
  maxLoanValue,
  onClick,
  isExpanded,
  goToRequestLoanTab,
  nftsAmount,
}) => {
  const { collectionName, collectionImage, tensorSlug } = marketPreview

  return (
    <div className={styles.card}>
      <div
        onClick={onClick}
        className={classNames(styles.cardBody, { [styles.expanded]: isExpanded })}
      >
        <div className={styles.mainInfoContainer}>
          <img src={collectionImage} className={styles.collateralImage} />
          <h4 className={styles.collateralName}>{collectionName}</h4>
          {tensorSlug && <TensorLink slug={tensorSlug} />}
        </div>

        <div className={styles.additionalContentWrapper}>
          <MarketBorrowCardInfo
            marketPreview={marketPreview}
            maxLoanValue={maxLoanValue}
            nftsAmount={nftsAmount}
            isExpanded={isExpanded}
          />

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
  maxLoanValue: number
  nftsAmount: number
  isExpanded: boolean
}

const MarketBorrowCardInfo: FC<MarketBorrowCardInfoProps> = ({
  marketPreview,
  maxLoanValue,
  nftsAmount,
  isExpanded,
}) => {
  const { marketApr: marketAprBasePoints, collectionFloor } = marketPreview

  const marketApr = (marketAprBasePoints + BONDS.REPAY_FEE_APR) / 100

  const upfrontFee = (maxLoanValue * BONDS.PROTOCOL_FEE) / BASE_POINTS
  const adjustedBestOffer = maxLoanValue - upfrontFee

  const ltv = (maxLoanValue / collectionFloor) * 100

  const classNamesProps = {
    container: styles.infoStat,
    labelWrapper: styles.infoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.infoStats, { [styles.expanded]: isExpanded })}>
      <StatInfo
        label="Top offer"
        value={<DisplayValue value={adjustedBestOffer} />}
        secondValue={`${ltv.toFixed(0)}% LTV`}
        classNamesProps={classNamesProps}
      />
      <StatInfo label="Nfts amount" value={nftsAmount} classNamesProps={classNamesProps} />
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
