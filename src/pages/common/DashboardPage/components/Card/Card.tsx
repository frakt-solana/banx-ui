import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'

import styles from './Card.module.less'

interface CollectionCardProps {
  market: core.MarketPreview
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

  const { connected } = useWallet()

  const formattedApr = marketApr / 100

  const classNamesStatProps = {
    label: styles.additionalLabelStat,
    value: styles.additionalValueStat,
  }

  return (
    <div className={styles.card}>
      <div className={styles.mainCardInfo}>
        <div className={styles.imageWrapper}>
          <img className={styles.mainCardImage} src={collectionImage} alt="" />
          <img className={styles.imageShadow} src={collectionImage} alt="" />
        </div>
        <span className={styles.mainCardName}>{collectionName}</span>
      </div>

      {connected && (
        <div className={styles.additionalCardInfo}>
          <StatInfo
            label="Max ltv"
            value={bestLtv}
            valueType={VALUES_TYPES.PERCENT}
            classNamesProps={classNamesStatProps}
            flexType="row"
          />
          <StatInfo
            label="APR"
            value={formattedApr}
            valueType={VALUES_TYPES.PERCENT}
            classNamesProps={classNamesStatProps}
            flexType="row"
          />

          <div className={styles.separateStat}>
            <StatInfo
              label="Max borrow"
              value={<DisplayValue value={bestOffer} />}
              classNamesProps={classNamesStatProps}
              flexType="row"
            />
          </div>
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
            value={activeBondsAmount}
            classNamesProps={classNamesStatProps}
            flexType="row"
          />

          <div className={styles.separateStat}>
            <StatInfo
              label="Max apr"
              value={formattedApr}
              valueType={VALUES_TYPES.PERCENT}
              classNamesProps={classNamesStatProps}
              flexType="row"
            />
          </div>
        </div>
      )}
    </div>
  )
}
