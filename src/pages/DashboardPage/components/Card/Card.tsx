import { FC, PropsWithChildren } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import ImageWithPreload from '@banx/components/ImageWithPreload'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Snowflake } from '@banx/icons'

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
  apy?: number //? rateBasePoints
}

export const LendCard: FC<LendCardProps> = ({ amountOfLoans, offerTvl, apy, ...props }) => {
  const BadgeContentElement = apy ? (
    <div className={styles.lendCardBadge}>
      {createPercentValueJSX(apy / 100)}
      <span>APY</span>
    </div>
  ) : null

  return (
    <CardBackdrop {...props} badgeElement={BadgeContentElement}>
      <div className={styles.lendCardFooter}>
        {createSolValueJSX(offerTvl, 1e9)}
        <span>in {amountOfLoans} loans</span>
      </div>
    </CardBackdrop>
  )
}

interface BorrowCardProps extends CardProps {
  dailyFee: number
  maxBorrow?: number
}

export const BorrowCard: FC<BorrowCardProps> = ({ dailyFee, maxBorrow, ...props }) => {
  const { connected } = useWallet()

  const statClassNames = {
    container: styles.borrowCardStatContainer,
    value: styles.borrowCardStatValue,
  }

  const BadgeContentElement = !connected ? <>+{createSolValueJSX(maxBorrow, 1e9)}</> : null

  return (
    <CardBackdrop {...props} badgeElement={BadgeContentElement} disabled={!maxBorrow}>
      <div className={classNames(styles.borrowCardFooter, { [styles.fullHeight]: connected })}>
        <StatInfo
          label="Pepetual"
          value="72h"
          icon={Snowflake}
          valueType={VALUES_TYPES.STRING}
          classNamesProps={statClassNames}
        />
        <StatInfo label="Daily fee" value={dailyFee} classNamesProps={statClassNames} />
      </div>
      {connected && (
        <Button className={styles.borrowButton} disabled={!maxBorrow}>
          {maxBorrow ? <>Get {createSolValueJSX(maxBorrow, 1e9)}</> : 'No offers'}
        </Button>
      )}
    </CardBackdrop>
  )
}
