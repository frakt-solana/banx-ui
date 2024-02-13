import { FC, PropsWithChildren, useMemo } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import ImageWithPreload from '@banx/components/ImageWithPreload'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { BorrowNft, MarketPreview, Offer } from '@banx/api/core'
import { BONDS, MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { calculateApr, calculateLoanValue, formatDecimal } from '@banx/utils'

import { calLoanValueWithFees, calcWeeklyInterestFee } from './helpers'

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
        {createSolValueJSX(offerTvl, 1e9, '0◎')}
        <span>in {amountOfLoans} loans</span>
      </div>
    </CardBackdrop>
  )
}

interface MarketCardProps {
  market: MarketPreview
  onClick: () => void
}

export const MarketCard: FC<MarketCardProps> = ({ market, onClick }) => {
  const { bestOffer, collectionFloor, collectionImage } = market

  const BadgeContentElement = <>+{createSolValueJSX(bestOffer, 1e9, '0◎', formatDecimal)}</>

  const ltv = (bestOffer / collectionFloor) * 100
  const ltvTooltipContent = createTooltipContent('Borrow up to', bestOffer)

  const customApr = MARKETS_WITH_CUSTOM_APR[market.marketPubkey]
  const apr = customApr !== undefined ? customApr / 100 : MAX_APR_VALUE

  return (
    <CardBackdrop image={collectionImage} onClick={onClick} badgeElement={BadgeContentElement}>
      <div className={styles.cardFooter}>
        <Stat label="Max ltv" value={ltv} tooltipContent={ltvTooltipContent} />
        <Stat label="Max apr" value={apr} />
      </div>
    </CardBackdrop>
  )
}

interface BorrowCardProps {
  nft: BorrowNft
  onClick: () => void
  findBestOffer: (marketPubkey: string) => Offer | null
}

export const BorrowCard: FC<BorrowCardProps> = ({ nft, onClick, findBestOffer }) => {
  const {
    nft: { collectionFloor, meta },
    loan: { marketPubkey },
  } = nft

  const bestOffer = useMemo(() => findBestOffer(marketPubkey), [findBestOffer, marketPubkey])

  const loanValue = bestOffer ? calculateLoanValue(bestOffer) : 0
  const loanValueWithFees = calLoanValueWithFees(bestOffer)

  const ltv = (loanValueWithFees / collectionFloor) * 100
  const apr = calculateApr({ loanValue, collectionFloor, marketPubkey })
  const weeklyFee = calcWeeklyInterestFee({ loanValue, apr })

  const formattedAprValue = (apr + BONDS.PROTOCOL_REPAY_FEE) / 100

  const aprTooltipContent = createTooltipContent('Weekly fee', weeklyFee)
  const ltvTooltipContent = createTooltipContent('Floor', collectionFloor)

  return (
    <CardBackdrop image={meta.imageUrl} onClick={onClick} disabled={!loanValue}>
      <div className={classNames(styles.cardFooter, styles.fullHeight)}>
        <Stat label="Ltv" value={ltv} tooltipContent={ltvTooltipContent} />
        <Stat label="Apr" value={formattedAprValue} tooltipContent={aprTooltipContent} />
      </div>
      <Button className={styles.borrowButton} disabled={!loanValue}>
        {!loanValue ? 'No offers' : <>Get {createSolValueJSX(loanValueWithFees, 1e9, '0◎')}</>}
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
      {createSolValueJSX(value, 1e9, '0◎', formatDecimal)}
    </span>
  </div>
)

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <TooltipRow label={label} value={value} />
  </div>
)
