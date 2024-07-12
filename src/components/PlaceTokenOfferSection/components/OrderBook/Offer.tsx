import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateAPRforOffer } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { TokenMeta } from '@banx/api/tokens'
import { Pencil } from '@banx/icons'
import { SyntheticTokenOffer } from '@banx/store/token'

import styles from './OrderBook.module.less'

interface OfferProps {
  offer: SyntheticTokenOffer
  collateral: TokenMeta | undefined
  collateralPrice: number
}

const Offer: FC<OfferProps> = ({ offer, collateral, collateralPrice }) => {
  const { publicKey: offerPubkey, collateralsPerToken, offerSize, isEdit } = offer
  const { decimals: collateralTokenDecimals = 0, FDV: marketCap = 0 } = collateral || {}

  const { connected } = useWallet()

  const isNewOffer = connected && offerPubkey === PUBKEY_PLACEHOLDER

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  const offerValue = collateralsPerToken
    ? (1 / collateralsPerToken) * Math.pow(10, collateralTokenDecimals)
    : 0

  const ltvPercent = (offerValue / collateralPrice) * 100
  const { apr: aprPercent } = calculateAPRforOffer(ltvPercent, marketCap)

  return (
    <li className={classNames(styles.listItem, commonHighlightClassNames)}>
      <div className={classNames(styles.highlightItem, commonHighlightClassNames)}>
        <Pencil />
      </div>

      <div className={styles.values}>
        <p
          className={classNames(styles.displayOfferValue, {
            [styles.hightlight]: isEdit || isNewOffer,
          })}
        >
          {offerValue}
        </p>
        <p className={styles.value}>{createPercentValueJSX(aprPercent)}</p>
        <p className={styles.value}>
          <DisplayValue value={offerSize} />
        </p>
      </div>
    </li>
  )
}

export default Offer