import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/nft'
import { TokenMarketPreview } from '@banx/api/tokens'

import styles from './Card.module.less'

interface CollectionCardProps {
  market: MarketPreview
}

export const CollectionCard: FC<CollectionCardProps> = ({ market }) => {
  const {
    activeBondsAmount,
    bestLtv,
    bestOffer,
    collectionName,
    collectionImage,
    loansTvl,
    marketApr,
  } = market

  return (
    <div className={styles.card}>
      <div className={styles.mainCardInfo}>
        <div className={styles.imageWrapper}>
          <img className={styles.mainCardImage} src={collectionImage} alt="" />
          <img className={styles.imageShadow} src={collectionImage} alt="" />
        </div>
        <span className={styles.mainCardName}>{collectionName}</span>
      </div>

      <MainStats
        maxLtv={bestLtv}
        apr={marketApr / 100}
        maxBorrow={bestOffer}
        loansTvl={loansTvl}
        activeLoansAmount={activeBondsAmount}
      />
    </div>
  )
}

interface TokenCardProps {
  market: TokenMarketPreview
}

export const TokenCard: FC<TokenCardProps> = ({ market }) => {
  const { bestLtv, offersTvl, collectionName, loansTvl, marketApr, activeLoansAmount, collateral } =
    market

  const adjustedApr = calcBorrowerTokenAPR(marketApr * 100) / 100

  return (
    <div className={styles.card}>
      <div className={styles.mainCardInfo}>
        <div className={styles.imageWrapper}>
          <img className={styles.mainCardImage} src={collateral.logoUrl} alt="" />
          <img className={styles.imageShadow} src={collateral.logoUrl} alt="" />
        </div>
        <span className={styles.mainCardName}>{collectionName}</span>
      </div>

      <MainStats
        maxLtv={bestLtv}
        apr={adjustedApr}
        maxBorrow={offersTvl}
        loansTvl={loansTvl}
        activeLoansAmount={activeLoansAmount}
      />
    </div>
  )
}

interface MainStatsProps {
  maxLtv: number
  apr: number
  maxBorrow: number

  loansTvl: number
  activeLoansAmount: number
}

const MainStats: FC<MainStatsProps> = ({ maxLtv, apr, maxBorrow, loansTvl, activeLoansAmount }) => {
  const { connected } = useWallet()

  const classNamesStatProps = {
    label: styles.additionalLabelStat,
    value: styles.additionalValueStat,
  }

  return (
    <>
      {connected && (
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
      )}

      {!connected && (
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
      )}
    </>
  )
}
