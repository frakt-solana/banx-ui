import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { MIN_BORROWER_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { ChevronDown } from '@banx/icons'

import ExpandedCardContent from '../ExpandedCardContent'

import styles from './BorrowCard.module.less'

interface BorrowCardProps {
  market: core.MarketPreview
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

const MarketMainInfo: FC<{ market: core.MarketPreview }> = ({ market }) => {
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
          tooltipText="Lowest listing price on marketplaces, excluding taker royalties and fees"
        />
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: core.MarketPreview
  isOpen: boolean
}
const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isOpen }) => {
  const { loansTvl, activeBondsAmount } = market

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
        label="Min apr"
        value={MIN_BORROWER_APR_VALUE}
        tooltipText="Minimum annual interest rate. Ranges between 16-110% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken"
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ container: styles.additionalStat, value: styles.additionalAprStat }}
      />
    </div>
  )
}
