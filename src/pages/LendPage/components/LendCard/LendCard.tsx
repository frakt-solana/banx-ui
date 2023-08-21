import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { MarketPreview } from '@banx/api/core'
import { ChevronDown } from '@banx/icons'

import ExpandableCardContent from '../ExpandableCardContent'
import { MarketAdditionalInfo, MarketMainInfo } from '../MarketOverviewInfo'

import styles from './LendCard.module.less'

interface LendCardProps {
  market: MarketPreview
  isCardOpen: boolean
  isOrderBookVisible: boolean
  onCardClick: () => void
}

const LendCard: FC<LendCardProps> = ({ isCardOpen, onCardClick, market, isOrderBookVisible }) => {
  return (
    <div className={classNames(styles.card, { [styles.active]: isCardOpen })}>
      <div className={styles.cardBody} onClick={onCardClick}>
        <MarketMainInfo market={market} />
        <div className={styles.row}>
          <MarketAdditionalInfo market={market} />
          <Button
            type="circle"
            className={classNames(styles.chevronButton, { [styles.active]: isCardOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isCardOpen && (
        <ExpandableCardContent
          marketPubkey={market.marketPubkey}
          isOrderBookVisible={isOrderBookVisible}
        />
      )}
    </div>
  )
}

export default LendCard
