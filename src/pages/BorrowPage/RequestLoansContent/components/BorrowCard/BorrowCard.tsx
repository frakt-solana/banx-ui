import React, { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { ChevronDown } from '@banx/icons'

import ExpandedCardContent from '../ExpandedCardContent'

import styles from './BorrowCard.module.less'

interface BorrowCardProps {
  market: MarketPreview
  onClick: () => void
  isOpen: boolean
}

const BorrowCard: FC<BorrowCardProps> = ({ market, onClick, isOpen }) => {
  return (
    <div className={styles.card}>
      <div className={classNames(styles.cardBody, { [styles.opened]: isOpen })} onClick={onClick}>
        <MarketMainInfo market={market} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo market={market} isOpen={isOpen} />
          <Button
            type="circle"
            className={classNames(styles.chevronButton, { [styles.opened]: isOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isOpen && <ExpandedCardContent market={market} />}
    </div>
  )
}

export default BorrowCard

const MarketMainInfo: FC<{ market: MarketPreview }> = ({ market }) => {
  const { collectionName, collectionImage, collectionFloor, tensorSlug } = market

  return (
    <div className={styles.mainInfoContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainInfoContent}>
        <div className={styles.collectionInfo}>
          <h4 className={styles.collectionName}>{collectionName}</h4>
          {tensorSlug && <TensorLink className={styles.tensorLink} slug={tensorSlug} />}
        </div>
        <StatInfo
          label="Floor"
          value={<DisplayValue value={collectionFloor} />}
          tooltipText="Highest offer among all lenders providing liquidity for this collection"
        />
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: MarketPreview
  isOpen: boolean
}
const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isOpen }) => {
  const { loansTvl, activeBondsAmount } = market

  //TODO: ask about apr
  const MAX_APR = 104

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="In loans"
        value={<DisplayValue value={loansTvl} />}
        secondValue={`in ${activeBondsAmount} loans`}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={{ container: styles.additionalStat }}
      />
      <StatInfo
        label="Apr"
        value={MAX_APR}
        tooltipText="Maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken"
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ container: styles.additionalStat, value: styles.additionalAprStat }}
      />
    </div>
  )
}
