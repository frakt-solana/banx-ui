import { FC, PropsWithChildren } from 'react'

import ImageWithPreload from '@banx/components/ImageWithPreload'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Snowflake } from '@banx/icons'

import styles from './Card.module.less'

interface CardProps {
  image: string
  onClick?: () => void
  className?: string
  badgeJSX?: JSX.Element
}

const CardBackdrop: FC<PropsWithChildren<CardProps>> = ({ onClick, image, badgeJSX, children }) => (
  <div className={styles.card} onClick={onClick}>
    {badgeJSX && <div className={styles.badge}>{badgeJSX}</div>}
    <ImageWithPreload src={image} className={styles.nftImage} square />
    {children}
  </div>
)

interface LendCardProps extends CardProps {
  amountOfLoans: number
  offerTvl: number
  apy?: number
}

export const LendCard: FC<LendCardProps> = ({ image, amountOfLoans, offerTvl, apy }) => {
  const BadgeContentJSX = apy ? (
    <div className={styles.lendCardBadge}>
      <span>{apy}%</span>
      <span>APY</span>
    </div>
  ) : (
    <></>
  )

  return (
    <CardBackdrop image={image} badgeJSX={BadgeContentJSX}>
      <div className={styles.lendCardFooter}>
        <span>{createSolValueJSX(offerTvl)}</span>
        <span>in {amountOfLoans} loans</span>
      </div>
    </CardBackdrop>
  )
}

interface BorrowCardProps extends CardProps {
  dailyFee: number
  maxAvailableToBorrow?: number
}

export const BorrowCard: FC<BorrowCardProps> = ({ image, dailyFee, maxAvailableToBorrow }) => {
  const statClassNames = {
    container: styles.borrowCardStatContainer,
    value: styles.borrowCardStatValue,
  }

  const BadgeContentJSX = <>+{createSolValueJSX(maxAvailableToBorrow)}</>

  return (
    <CardBackdrop image={image} badgeJSX={BadgeContentJSX}>
      <div className={styles.borrowCardFooter}>
        <StatInfo
          label="Pepetual"
          value="72h"
          icon={Snowflake}
          valueType={VALUES_TYPES.STRING}
          classNamesProps={statClassNames}
        />
        <StatInfo label="Daily fee" value={dailyFee} classNamesProps={statClassNames} />
      </div>
    </CardBackdrop>
  )
}
