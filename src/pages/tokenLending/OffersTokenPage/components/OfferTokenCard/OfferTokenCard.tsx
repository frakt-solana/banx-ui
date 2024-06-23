import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { ChevronDown, Coin, CoinPlus, SOL, USDC, Warning } from '@banx/icons'
import { useNftTokenType } from '@banx/store/nft'
import { isSolTokenType } from '@banx/utils'

import ExpandedCardContent from '../ExpandedCardContent'

import styles from './OfferTokenCard.module.less'

interface OfferTokenCardProps {
  offerPreview: core.TokenOfferPreview
  onClick: () => void
  isOpen: boolean
}

const OfferTokenCard: FC<OfferTokenCardProps> = ({ offerPreview, onClick, isOpen }) => {
  return (
    <div className={styles.card}>
      <div className={classNames(styles.cardBody, { [styles.opened]: isOpen })} onClick={onClick}>
        <MarketMainInfo offerPreview={offerPreview} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo offerPreview={offerPreview} isOpen={isOpen} />
          <Button
            type="circle"
            className={classNames(styles.chevronButton, { [styles.opened]: isOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isOpen && (
        <ExpandedCardContent
          marketPubkey={offerPreview.tokenMarketPreview.marketPubkey}
          offerPubkey={offerPreview.publicKey}
        />
      )}
    </div>
  )
}

export default OfferTokenCard

const MarketMainInfo: FC<{ offerPreview: core.TokenOfferPreview }> = ({ offerPreview }) => {
  const { collateral, collateralPrice, bestOffer } = offerPreview.tokenMarketPreview

  const { tokenType } = useNftTokenType()

  const Icon = isSolTokenType(tokenType) ? SOL : USDC

  return (
    <div className={styles.mainInfoContainer}>
      <div className={styles.collateralImageWrapper}>
        <img src={collateral.logoUrl} className={styles.collateralImage} />
        <Icon className={styles.collateralIcon} />
      </div>
      <div className={styles.mainInfoContent}>
        <h4 className={styles.collateralName}>{collateral.ticker}</h4>
        <div className={styles.mainInfoStats}>
          <StatInfo
            label="Market"
            value={<DisplayValue value={collateralPrice} />}
            tooltipText=""
          />
          <StatInfo label="Top offer" value={<DisplayValue value={bestOffer} />} tooltipText="" />
        </div>
      </div>
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
  const { marketApr, marketApy } = offerPreview.tokenMarketPreview

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="In loans"
        value={<DisplayValue value={inLoans} />}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={{ container: styles.additionalStat }}
      />
      <StatInfo
        label="In offers"
        value={<DisplayValue value={offerSize} />}
        tooltipText="Liquidity that is locked in active offers"
        classNamesProps={{ container: styles.additionalStat }}
      />
      <StatInfo
        label="APR / APY"
        value={
          <>
            {createPercentValueJSX(marketApr, '0%')} / {createPercentValueJSX(marketApy, '0%')}
          </>
        }
        tooltipText="APR / APY"
        classNamesProps={{ container: styles.additionalStat, value: styles.additionalAprStat }}
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
        tooltipText="Status"
        classNamesProps={{ container: styles.additionalStat }}
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
      <div className={styles.loansStatusIcon}>
        <CoinPlus />
        <span>{terminatingLoansAmount}</span>,
      </div>
      <div className={styles.loansStatusIcon}>
        <Warning />
        <span>{liquidatedLoansAmount}</span>,
      </div>
      <div className={styles.loansStatusIcon}>
        <Coin />
        <span>{repaymentCallsAmount}</span>
      </div>
    </div>
  )
}
