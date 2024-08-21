import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { ChevronDown, SOLFilled, USDC } from '@banx/icons'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals, isBanxSolTokenType } from '@banx/utils'

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
            className={classNames(styles.chevronButton, { [styles.opened]: isOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isOpen && <ExpandedCardContent marketPubkey={market.marketPubkey} />}
    </div>
  )
}

export default LendTokenCard

const MarketMainInfo: FC<{ market: core.TokenMarketPreview }> = ({ market }) => {
  const { collateral, collateralPrice, bestOffer } = market

  const { tokenType } = useNftTokenType()
  const decimals = getTokenDecimals(tokenType)

  const Icon = isBanxSolTokenType(tokenType) ? (
    <SOLFilled className={classNames(styles.collateralIcon, styles.solFilled)} />
  ) : (
    <USDC className={styles.collateralIcon} viewBox="1 1 14 14" />
  )

  return (
    <div className={styles.mainInfoContainer}>
      <div className={styles.collateralImageWrapper}>
        <img src={collateral.logoUrl} className={styles.collateralImage} />
        {Icon}
      </div>
      <div className={styles.mainInfoContent}>
        <h4 className={styles.collateralName}>{collateral.ticker}</h4>
        <div className={styles.mainInfoStats}>
          <StatInfo
            label="Price"
            value={<DisplayValue value={collateralPrice} isSubscriptFormat />}
            tooltipText="Token market price"
          />
          <StatInfo
            label="Top offer"
            value={<DisplayValue value={bestOffer / decimals} isSubscriptFormat />}
            tooltipText="Highest offer among all lenders"
          />
        </div>
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: core.TokenMarketPreview
  isOpen: boolean
}

const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isOpen }) => {
  const { loansTvl, offersTvl, activeLoansAmount, activeOffersAmount, marketApr } = market

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="In loans"
        value={<DisplayValue value={loansTvl} />}
        secondValue={`in ${activeLoansAmount} loans`}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={{ container: styles.additionalStat }}
      />
      <StatInfo
        label="In offers"
        value={<DisplayValue value={offersTvl} />}
        secondValue={`in ${activeOffersAmount} offers`}
        tooltipText="Liquidity that is locked in active offers"
        classNamesProps={{ container: styles.additionalStat }}
      />
      <StatInfo
        label="Max APR"
        value={createPercentValueJSX(marketApr, '0%')}
        tooltipText="Maximum annual interest rate. Depends on the loan-to-value (LTV) offered and market capitalization"
        valueType={VALUES_TYPES.STRING}
        classNamesProps={{ container: styles.additionalStat, value: styles.additionalAprStat }}
      />
    </div>
  )
}
