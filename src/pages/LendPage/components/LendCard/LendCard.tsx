import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { MarketPreview } from '@banx/api/bonds'
import { ChevronDown } from '@banx/icons'

import ExpandableCardContent from './components/ExpandableCardContent'
import { MarketAdditionalInfo, MarketMainInfo } from './components/MarketOverviewInfo'

import styles from './LendCard.module.less'

interface LendCardProps {
  market: MarketPreview
  isVisible: boolean
  visibleOrderBook: boolean
  onCardClick: () => void
}

const LendCard: FC<LendCardProps> = ({ isVisible, onCardClick, market }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardBody} onClick={onCardClick}>
        <MarketMainInfo market={market} />
        <div className={styles.row}>
          <MarketAdditionalInfo market={market} />
          <Button
            type="circle"
            size="medium"
            className={classNames(styles.chevronButton, { [styles.active]: isVisible })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isVisible && <ExpandableCardContent marketPubkey={market?.marketPubkey} />}
    </div>
  )
}

export default LendCard
