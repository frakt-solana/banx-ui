import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateAPRforOffer } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { TokenMeta } from '@banx/api/tokens'
import { Pencil } from '@banx/icons'
import { SyntheticTokenOffer } from '@banx/store/token'

import {
  calculateTokensPerCollateral,
  formatTokensPerCollateralToStr,
} from '../../hooks/useOfferFormController'

import styles from './OrderBook.module.less'

interface OfferProps {
  offer: SyntheticTokenOffer
  collateral: TokenMeta | undefined
  collateralPrice: number
}

const Offer: FC<OfferProps> = ({ offer, collateral, collateralPrice }) => {
  const { publicKey: offerPubkey, collateralsPerToken, offerSize, isEdit } = offer
  const { decimals: collateralTokenDecimals = 0 } = collateral || {}

  const { connected } = useWallet()

  const isNewOffer = connected && offerPubkey.toBase58() === PUBKEY_PLACEHOLDER

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  const tokensPerCollateralBN = calculateTokensPerCollateral(
    collateralsPerToken,
    collateralTokenDecimals,
  )

  const offerValue = formatTokensPerCollateralToStr(tokensPerCollateralBN)

  const ltvPercent = (parseFloat(offerValue) / collateralPrice) * 100 || 0

  const fullyDilutedValuationNumber = collateral
    ? parseFloat(collateral.fullyDilutedValuationInMillions)
    : 0

  const { factoredApr: aprPercent } = calculateAPRforOffer(ltvPercent, fullyDilutedValuationNumber)

  return (
    <li className={classNames(styles.listItem, commonHighlightClassNames)}>
      <div className={classNames(styles.highlightItem, commonHighlightClassNames)}>
        <Pencil />
      </div>

      <div className={styles.values}>
        <p className={styles.displayOfferValue}>{offerValue}</p>
        <p className={styles.value}>{createPercentValueJSX(aprPercent)}</p>
        <p className={styles.value}>
          <DisplayValue value={offerSize} />
        </p>
      </div>
    </li>
  )
}

export default Offer
