import { FC } from 'react'

import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/nft'
import { TokenMarketPreview } from '@banx/api/tokens'
import { NFT_MARKETS_WITH_CUSTOM_APR } from '@banx/constants'

import styles from './Card.module.less'

interface CardGeneralInfoProps {
  name: string
  imageUrl: string
}

const CardGeneralInfo: FC<CardGeneralInfoProps> = ({ name, imageUrl }) => (
  <div className={styles.mainCardInfo}>
    <div className={styles.imageWrapper}>
      <img className={styles.mainCardImage} src={imageUrl} alt="" />
      <img className={styles.imageShadow} src={imageUrl} alt="" />
    </div>
    <span className={styles.mainCardName}>{name}</span>
  </div>
)

export const CollectionCard: FC<{ market: MarketPreview }> = ({ market }) => {
  const { bestLtv, bestOffer, collectionName, collectionImage } = market

  const apr = getCustomApr(market.marketPubkey)

  return (
    <div className={styles.card}>
      <CardGeneralInfo name={collectionName} imageUrl={collectionImage} />
      <BorrowStats maxLtv={bestLtv} apr={apr} maxBorrow={bestOffer} />
    </div>
  )
}

export const LendCollectionCard: FC<{ market: MarketPreview }> = ({ market }) => {
  const { activeBondsAmount, collectionName, collectionImage, loansTvl } = market

  const apr = getCustomApr(market.marketPubkey)

  return (
    <div className={styles.card}>
      <CardGeneralInfo name={collectionName} imageUrl={collectionImage} />
      <LendStats apr={apr} loansTvl={loansTvl} activeLoansAmount={activeBondsAmount} />
    </div>
  )
}

export const TokenCard: FC<{ market: TokenMarketPreview }> = ({ market }) => {
  const { bestLtv, offersTvl, marketApr, collateral } = market

  const adjustedApr = calcBorrowerTokenAPR(marketApr * 100) / 100

  return (
    <div className={styles.card}>
      <CardGeneralInfo name={collateral.ticker} imageUrl={collateral.logoUrl} />
      <BorrowStats maxLtv={bestLtv} apr={adjustedApr} maxBorrow={offersTvl} />
    </div>
  )
}

export const LendTokenCard: FC<{ market: TokenMarketPreview }> = ({ market }) => {
  const { loansTvl, marketApr, activeLoansAmount, collateral } = market

  const adjustedApr = calcBorrowerTokenAPR(marketApr * 100) / 100

  return (
    <div className={styles.card}>
      <CardGeneralInfo name={collateral.ticker} imageUrl={collateral.logoUrl} />
      <LendStats apr={adjustedApr} loansTvl={loansTvl} activeLoansAmount={activeLoansAmount} />
    </div>
  )
}

interface BorrowStatsProps {
  apr: number
  maxBorrow: number
  maxLtv: number
}

const BorrowStats: FC<BorrowStatsProps> = ({ apr, maxBorrow, maxLtv }) => {
  const classNamesStatProps = {
    label: styles.additionalLabelStat,
    value: styles.additionalValueStat,
  }

  return (
    <div className={styles.additionalCardInfo}>
      <StatInfo
        label="Max ltv"
        value={maxLtv}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={classNamesStatProps}
        flexType="row"
      />
      <StatInfo
        label="APR"
        value={apr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={classNamesStatProps}
        flexType="row"
      />

      <div className={styles.dashedLine} />

      <StatInfo
        label="Max borrow"
        value={<DisplayValue value={maxBorrow} />}
        classNamesProps={classNamesStatProps}
        flexType="row"
      />
    </div>
  )
}

interface LendStatsProps {
  apr: number
  loansTvl: number
  activeLoansAmount: number
}

const LendStats: FC<LendStatsProps> = ({ apr, loansTvl, activeLoansAmount }) => {
  const classNamesStatProps = {
    label: styles.additionalLabelStat,
    value: styles.additionalValueStat,
  }

  return (
    <div className={styles.additionalCardInfo}>
      <StatInfo
        label="Loans TVL"
        value={<DisplayValue value={loansTvl} />}
        classNamesProps={classNamesStatProps}
        flexType="row"
      />
      <StatInfo
        label="Loans amount"
        value={activeLoansAmount}
        classNamesProps={classNamesStatProps}
        flexType="row"
      />

      <div className={styles.dashedLine} />

      <StatInfo
        label="Max apr"
        value={apr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={classNamesStatProps}
        flexType="row"
      />
    </div>
  )
}

const getCustomApr = (marketPubkey: string) => {
  const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkey]
  return customApr !== undefined ? customApr / 100 : MAX_APR_VALUE
}
