import { FC, PropsWithChildren, useMemo } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import ImageWithPreload from '@banx/components/ImageWithPreload'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { coreNew } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { ZERO_BN, calculateApr, calculateLoanValue } from '@banx/utils'

import { calcLoanValueWithFees, calcWeeklyInterestFee } from './helpers'

import styles from './Card.module.less'

interface CardProps {
  image: string
  onClick?: () => void
  className?: string
  badgeElement?: JSX.Element | null
  disabled?: boolean
}

const CardBackdrop: FC<PropsWithChildren<CardProps>> = ({
  image,
  onClick,
  badgeElement,
  className,
  disabled,
  children,
}) => (
  <div
    onClick={onClick}
    className={classNames(
      styles.card,
      { [styles.clicable]: onClick },
      { [styles.disabled]: disabled },
      className,
    )}
  >
    {badgeElement && <div className={styles.badge}>{badgeElement}</div>}
    <ImageWithPreload src={image} className={styles.nftImage} square />
    {children}
  </div>
)

interface LendCardProps extends CardProps {
  amountOfLoans: number
  offerTvl: number
  apr?: number //? rateBasePoints
}

export const LendCard: FC<LendCardProps> = ({ amountOfLoans, offerTvl, apr, ...props }) => {
  const BadgeContentElement = apr ? (
    <div className={styles.lendCardBadge}>
      {MAX_APR_VALUE}%<span>MAX APR</span>
    </div>
  ) : null

  return (
    <CardBackdrop {...props} badgeElement={BadgeContentElement}>
      <div className={styles.lendCardFooter}>
        <DisplayValue value={offerTvl} />
        <span>in {amountOfLoans} loans</span>
      </div>
    </CardBackdrop>
  )
}

interface MarketCardProps {
  market: coreNew.MarketPreview
  onClick: () => void
}

export const MarketCard: FC<MarketCardProps> = ({ market, onClick }) => {
  const { bestOffer, collectionFloor, collectionImage, marketPubkey } = market

  const BadgeContentElement = (
    <>
      + <DisplayValue value={bestOffer.toNumber()} />
    </>
  )

  const ltv = (bestOffer.toNumber() / collectionFloor.toNumber()) * 100
  const ltvTooltipContent = createTooltipContent('Borrow up to', bestOffer.toNumber())

  const apr =
    calculateApr({ loanValue: market.bestOffer, collectionFloor, marketPubkey }).toNumber() / 100

  return (
    <CardBackdrop image={collectionImage} onClick={onClick} badgeElement={BadgeContentElement}>
      <div className={styles.cardFooter}>
        <Stat label="Max ltv" value={ltv} tooltipContent={ltvTooltipContent} />
        <Stat label="Apr" value={apr} />
      </div>
    </CardBackdrop>
  )
}

interface BorrowCardProps {
  nft: coreNew.BorrowNft
  onClick: () => void
  findBestOffer: (marketPubkey: string) => coreNew.Offer | null
  tokenType: LendingTokenType
}

export const BorrowCard: FC<BorrowCardProps> = ({ nft, onClick, findBestOffer, tokenType }) => {
  const {
    nft: { collectionFloor, meta },
    loan: { marketPubkey },
  } = nft

  const bestOffer = useMemo(
    () => findBestOffer(marketPubkey.toBase58()),
    [findBestOffer, marketPubkey],
  )

  const loanValue = bestOffer ? calculateLoanValue(bestOffer) : ZERO_BN
  const loanValueWithFees = calcLoanValueWithFees(bestOffer, tokenType)

  const ltv = Math.max((loanValueWithFees / collectionFloor.toNumber()) * 100, 0)
  const apr = calculateApr({ loanValue, collectionFloor, marketPubkey })
  const weeklyFee = calcWeeklyInterestFee({ loanValue, apr })

  const formattedAprValue = apr.add(BONDS.PROTOCOL_REPAY_FEE_BN).toNumber() / 100

  const aprTooltipContent = createTooltipContent('Weekly fee', weeklyFee.toNumber())
  const ltvTooltipContent = createTooltipContent('Floor', collectionFloor.toNumber())

  return (
    <CardBackdrop image={meta.imageUrl} onClick={onClick} disabled={!loanValue}>
      <div className={classNames(styles.cardFooter, styles.fullHeight)}>
        <Stat label="Ltv" value={ltv} tooltipContent={ltvTooltipContent} />
        <Stat label="Apr" value={formattedAprValue} tooltipContent={aprTooltipContent} />
      </div>
      <Button className={styles.borrowButton} disabled={!loanValue}>
        {!loanValue ? (
          'No offers'
        ) : (
          <>
            Get <DisplayValue value={loanValueWithFees} />
          </>
        )}
      </Button>
    </CardBackdrop>
  )
}

interface StatProps {
  label: string
  value: number
  tooltipContent?: JSX.Element
}

const Stat: FC<StatProps> = ({ value, tooltipContent, label }) => (
  <div className={styles.statCol}>
    <span className={styles.statLabel}>{label}</span>
    <Tooltip className={styles.tooltip} title={tooltipContent}>
      <span className={styles.statValue}>{createPercentValueJSX(value, '0%')}</span>
      {tooltipContent && <InfoCircleOutlined className={styles.tooltipIcon} />}
    </Tooltip>
  </div>
)

interface TooltipRowProps {
  label: string
  value: number
}
const TooltipRow: FC<TooltipRowProps> = ({ label, value }) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue value={value} />
    </span>
  </div>
)

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <TooltipRow label={label} value={value} />
  </div>
)
