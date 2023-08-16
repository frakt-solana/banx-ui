import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { MarketPreview } from '@banx/api/bonds'
import { ChevronDown } from '@banx/icons'

import ExpandableCardContent from '../ExpandableCardContent'
import { MarketAdditionalInfo, MarketMainInfo } from '../MarketOverviewInfo'

import styles from './LendCard.module.less'

interface LendCardProps {
  market: MarketPreview
  cardIsOpen: boolean
  visibleOrderBook: boolean
  onCardClick: () => void
}

const LendCard: FC<LendCardProps> = ({ cardIsOpen, onCardClick, market, visibleOrderBook }) => {
  return (
    <div className={classNames(styles.card, { [styles.active]: cardIsOpen })}>
      <div className={styles.cardBody} onClick={onCardClick}>
        <MarketMainInfo market={market} />
        <div className={styles.row}>
          <MarketAdditionalInfo market={market} />
          <Button
            type="circle"
            className={classNames(styles.chevronButton, { [styles.active]: cardIsOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {cardIsOpen && (
        <ExpandableCardContent
          marketPubkey={market.marketPubkey}
          visibleOrderBook={visibleOrderBook}
        />
      )}
    </div>
  )
}

export default LendCard
