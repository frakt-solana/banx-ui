import { FC, PropsWithChildren } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import ImageWithPreload from '@banx/components/ImageWithPreload'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/nft'
import { calculateApr } from '@banx/utils'

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
  market: core.MarketPreview
  onClick: () => void
}

export const MarketCard: FC<MarketCardProps> = ({ market, onClick }) => {
  const { bestOffer, collectionFloor, collectionImage, marketPubkey } = market

  const BadgeContentElement = (
    <>
      + <DisplayValue value={bestOffer} />
    </>
  )

  const ltv = (bestOffer / collectionFloor) * 100
  const ltvTooltipContent = createTooltipContent('Borrow up to', bestOffer)

  const apr = calculateApr({ loanValue: market.bestOffer, collectionFloor, marketPubkey }) / 100

  return (
    <CardBackdrop image={collectionImage} onClick={onClick} badgeElement={BadgeContentElement}>
      <div className={styles.cardFooter}>
        <Stat label="Max ltv" value={ltv} tooltipContent={ltvTooltipContent} />
        <Stat label="Apr" value={apr} />
      </div>
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
