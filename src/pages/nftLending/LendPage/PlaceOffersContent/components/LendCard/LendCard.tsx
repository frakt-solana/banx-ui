import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/nft'
import { NFT_MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { ChevronDown, Fire } from '@banx/icons'

import { TOOLTIP_TEXTS } from '../../constants'
import ExpandableCardContent from '../ExpandableCardContent'

import styles from './LendCard.module.less'

interface LendCardProps {
  market: core.MarketPreview
  isCardOpen: boolean
  onCardClick: () => void
}

const LendCard: FC<LendCardProps> = ({ isCardOpen, onCardClick, market }) => {
  return (
    <div className={styles.card}>
      <div
        onClick={onCardClick}
        className={classNames(styles.cardBody, { [styles.opened]: isCardOpen })}
      >
        <MarketMainInfo market={market} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo market={market} isCardOpen={isCardOpen} />
          <Button
            type="circle"
            size="medium"
            className={classNames(styles.chevronButton, { [styles.opened]: isCardOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isCardOpen && <ExpandableCardContent marketPubkey={market.marketPubkey} />}
    </div>
  )
}

export default LendCard

const MarketMainInfo: FC<{ market: core.MarketPreview }> = ({ market }) => {
  const { collectionName, isHot, tensorSlug } = market

  return (
    <div className={styles.mainInfoContainer}>
      <img src={market.collectionImage} className={styles.collectionImage} />
      <h4 className={styles.collectionName}>{collectionName}</h4>
      {tensorSlug && <TensorLink slug={tensorSlug} />}
      {isHot && (
        <Tooltip title="Collection is in huge demand waiting for lenders!">
          <Fire />
        </Tooltip>
      )}
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: core.MarketPreview
  isCardOpen: boolean
}

const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isCardOpen }) => {
  const {
    activeBondsAmount,
    activeOfferAmount,
    bestOffer,
    collectionFloor,
    loansTvl,
    marketPubkey,
    offerTvl,
  } = market

  const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkey]
  const apr = customApr !== undefined ? customApr / 100 : MAX_APR_VALUE

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isCardOpen })}>
      <StatInfo
        label="Floor"
        value={<DisplayValue value={collectionFloor} />}
        tooltipText={TOOLTIP_TEXTS.FLOOR}
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Top offer"
        value={<DisplayValue value={bestOffer} />}
        tooltipText={TOOLTIP_TEXTS.TOP_OFFER}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="In loans"
        value={<DisplayValue value={loansTvl} />}
        secondValue={`in ${activeBondsAmount} loans`}
        tooltipText={TOOLTIP_TEXTS.IN_LOANS}
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Size"
        value={<DisplayValue value={offerTvl} />}
        secondValue={`in ${activeOfferAmount} offers`}
        tooltipText={TOOLTIP_TEXTS.SIZE}
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Max apr"
        value={apr}
        tooltipText={TOOLTIP_TEXTS.MAX_APR}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />
    </div>
  )
}
