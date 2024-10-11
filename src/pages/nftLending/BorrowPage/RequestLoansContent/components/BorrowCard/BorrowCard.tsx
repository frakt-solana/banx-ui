import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { MIN_BORROWER_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { ChevronDown } from '@banx/icons'

import { TOOLTIP_TEXTS } from '../../constants'
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
      <div onClick={onClick} className={classNames(styles.cardBody, { [styles.opened]: isOpen })}>
        <MarketMainInfo market={market} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo market={market} isOpen={isOpen} />
          <Button
            type="circle"
            size="medium"
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
  const { collectionName, collectionImage, tensorSlug } = market

  return (
    <div className={styles.mainInfoContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <h4 className={styles.collectionName}>{collectionName}</h4>
      {tensorSlug && <TensorLink slug={tensorSlug} />}
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: core.MarketPreview
  isOpen: boolean
}
const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isOpen }) => {
  const { activeBondsAmount, collectionFloor, loansTvl } = market

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="Floor"
        value={<DisplayValue value={collectionFloor} />}
        tooltipText={TOOLTIP_TEXTS.FLOOR}
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="In loans"
        value={<DisplayValue value={loansTvl} />}
        secondValue={`in ${activeBondsAmount} loans`}
        tooltipText={TOOLTIP_TEXTS.IN_LOANS}
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Min apr"
        value={MIN_BORROWER_APR_VALUE}
        tooltipText={TOOLTIP_TEXTS.MIN_APR}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />
    </div>
  )
}
