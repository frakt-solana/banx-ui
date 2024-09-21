import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { ChevronDown } from '@banx/icons'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import ExpandedCardContent from '../ExpandedCardContent'

import styles from './LendTokenCard.module.less'

interface LendTokenCardProps {
  market: core.TokenMarketPreview
  onClick: () => void
  isOpen: boolean
}

const LendTokenCard: FC<LendTokenCardProps> = ({ market, onClick, isOpen }) => {
  return (
    <div className={styles.card}>
      <div className={classNames(styles.cardBody, { [styles.opened]: isOpen })} onClick={onClick}>
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

export default LendTokenCard

const MarketMainInfo: FC<{ market: core.TokenMarketPreview }> = ({ market }) => (
  <div className={styles.mainInfoContainer}>
    <img src={market.collateral.logoUrl} className={styles.collateralImage} />
    <h4 className={styles.collateralName}>{market.collateral.ticker}</h4>
  </div>
)

interface MarketAdditionalInfoProps {
  market: core.TokenMarketPreview
  isOpen: boolean
}

const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isOpen }) => {
  const {
    collateralPrice,
    bestOffer,
    loansTvl,
    offersTvl,
    activeLoansAmount,
    activeOffersAmount,
    marketApr,
  } = market

  const { tokenType } = useNftTokenType()
  const decimals = getTokenDecimals(tokenType)

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="Price"
        value={<DisplayValue value={collateralPrice / decimals} isSubscriptFormat />}
        tooltipText="Token market price"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Top offer"
        value={<DisplayValue value={bestOffer / decimals} isSubscriptFormat />}
        tooltipText="Token market price"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="In loans"
        value={<DisplayValue value={loansTvl} />}
        secondValue={`${activeLoansAmount} loans`}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="In offers"
        value={<DisplayValue value={offersTvl} />}
        secondValue={`${activeOffersAmount} offers`}
        tooltipText="Liquidity that is locked in active offers"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Average APR"
        value={marketApr}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText="Maximum annual interest rate. Depends on the loan-to-value (LTV) offered and market capitalization"
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />
    </div>
  )
}
