import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { calculateLtvPercent } from '@banx/components/PlaceTokenOfferSection'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/tokens'
import { ChevronDown, Coin, CoinPlus, Warning } from '@banx/icons'
import { useNftTokenType } from '@banx/store/nft'
import { convertToSynthetic, useSyntheticTokenOffers } from '@banx/store/token'
import {
  HealthColorIncreasing,
  calculateTokensPerCollateral,
  formatTokensPerCollateralToStr,
  getColorByPercent,
  getTokenDecimals,
} from '@banx/utils'

import ExpandedCardContent from '../ExpandedCardContent'

import styles from './OfferTokenCard.module.less'

interface OfferTokenCardProps {
  offerPreview: core.TokenOfferPreview
  isOpen: boolean
  onToggleCard: () => void
}

const OfferTokenCard: FC<OfferTokenCardProps> = ({ offerPreview, isOpen, onToggleCard }) => {
  const { setOffer: setSyntheticOffer } = useSyntheticTokenOffers()

  const onCardClick = () => {
    onToggleCard()
    setSyntheticOffer(convertToSynthetic(offerPreview.bondOffer, true))
  }

  return (
    <div className={styles.card}>
      <div
        className={classNames(styles.cardBody, { [styles.opened]: isOpen })}
        onClick={onCardClick}
      >
        <MarketMainInfo offerPreview={offerPreview} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo offerPreview={offerPreview} isOpen={isOpen} />
          <Button
            type="circle"
            size="medium"
            className={classNames(styles.chevronButton, { [styles.opened]: isOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isOpen && (
        <ExpandedCardContent
          market={offerPreview.tokenMarketPreview}
          offerPubkey={offerPreview.publicKey}
        />
      )}
    </div>
  )
}

export default OfferTokenCard

const MarketMainInfo: FC<{ offerPreview: core.TokenOfferPreview }> = ({ offerPreview }) => {
  const { collateral } = offerPreview.tokenMarketPreview

  return (
    <div className={styles.mainInfoContainer}>
      <img src={collateral.logoUrl} className={styles.collateralImage} />
      <h4 className={styles.collateralName}>{collateral.ticker}</h4>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  offerPreview: core.TokenOfferPreview
  isOpen: boolean
}

const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ offerPreview, isOpen }) => {
  const {
    inLoans,
    offerSize,
    terminatingLoansAmount,
    liquidatedLoansAmount,
    repaymentCallsAmount,
  } = offerPreview.tokenOfferPreview

  const { collateral, collateralPrice } = offerPreview.tokenMarketPreview

  const { tokenType } = useNftTokenType()
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const aprPercent = offerPreview.bondOffer.loanApr.toNumber() / 100

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  const tokensPerCollateral = formatTokensPerCollateralToStr(
    calculateTokensPerCollateral(
      offerPreview.bondOffer.validation.collateralsPerToken,
      collateral.decimals,
    ),
  )

  const ltvPercent = calculateLtvPercent({
    collateralPerToken: tokensPerCollateral,
    collateralPrice,
    marketTokenDecimals,
  })

  const formattedPrice = collateralPrice / Math.pow(10, marketTokenDecimals)

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="Price"
        value={<DisplayValue value={formattedPrice} isSubscriptFormat />}
        tooltipText="Token market price"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="My offer"
        value={<DisplayValue value={parseFloat(tokensPerCollateral)} isSubscriptFormat />}
        classNamesProps={{ ...classNamesProps, value: styles.myOfferStat }}
        secondValue={
          <span style={{ color: getColorByPercent(ltvPercent, HealthColorIncreasing) }}>
            {createPercentValueJSX(ltvPercent)} LTV
          </span>
        }
      />
      <StatInfo
        label="In loans"
        value={<DisplayValue value={inLoans} />}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="In offer"
        value={<DisplayValue value={offerSize} />}
        tooltipText="Liquidity that is locked in offer"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="APR"
        value={createPercentValueJSX(aprPercent, '0%')}
        tooltipText="Maximum annual interest rate. Depends on the loan-to-value (LTV) offered and market capitalization"
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />
      <StatInfo
        label="Status"
        value={
          <LoansStatus
            terminatingLoansAmount={terminatingLoansAmount}
            liquidatedLoansAmount={liquidatedLoansAmount}
            repaymentCallsAmount={repaymentCallsAmount}
          />
        }
        classNamesProps={classNamesProps}
      />
    </div>
  )
}

interface LoansStatusProps {
  terminatingLoansAmount: number
  liquidatedLoansAmount: number
  repaymentCallsAmount: number
}

const LoansStatus: FC<LoansStatusProps> = ({
  terminatingLoansAmount,
  liquidatedLoansAmount,
  repaymentCallsAmount,
}) => {
  return (
    <div className={styles.loansStatus}>
      <Tooltip title="Terminating loans">
        <div className={styles.loansStatusIcon}>
          <CoinPlus />
          <span>{terminatingLoansAmount}</span>,
        </div>
      </Tooltip>

      <Tooltip title="Liquidated loans">
        <div className={styles.loansStatusIcon}>
          <Warning />
          <span>{liquidatedLoansAmount}</span>,
        </div>
      </Tooltip>

      <Tooltip title="Repayment calls">
        <div className={styles.loansStatusIcon}>
          <Coin />
          <span>{repaymentCallsAmount}</span>
        </div>
      </Tooltip>
    </div>
  )
}
