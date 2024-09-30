import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import {
  DisplayValue,
  createDisplayValueJSX,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { TokenMeta } from '@banx/api/tokens'
import { Pencil } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { SyntheticTokenOffer } from '@banx/store/token'
import {
  calculateTokensPerCollateral,
  formatTokensPerCollateralToStr,
  getTokenDecimals,
  getTokenUnit,
} from '@banx/utils'

import { calculateLtvPercent } from '../../helpers'

import styles from './OrderBook.module.less'

interface OfferProps {
  offer: SyntheticTokenOffer
  collateral: TokenMeta | undefined
  collateralPrice: number | undefined
}

const Offer: FC<OfferProps> = ({ offer, collateral, collateralPrice = 0 }) => {
  const { publicKey: offerPubkey, collateralsPerToken, offerSize, isEdit, apr } = offer
  const { decimals: collateralDecimals = 0 } = collateral || {}

  const { connected } = useWallet()
  const { tokenType } = useTokenType()

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType))

  const isNewOffer = connected && offerPubkey.toBase58() === PUBKEY_PLACEHOLDER

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  const tokensPerCollateralBN = calculateTokensPerCollateral(
    collateralsPerToken,
    collateralDecimals,
  )

  const offerValue = formatTokensPerCollateralToStr(tokensPerCollateralBN)

  const ltvPercent = calculateLtvPercent({
    collateralPerToken: offerValue,
    collateralPrice,
    marketTokenDecimals,
  })

  const tokenUnit = getTokenUnit(tokenType)

  return (
    <li className={classNames(styles.offerListItem, commonHighlightClassNames)}>
      <div className={classNames(styles.offerHighlightIndicator, commonHighlightClassNames)}>
        <Pencil />
      </div>

      <div className={styles.offerDetailsContainer}>
        <div className={styles.offerDetails}>
          <p className={styles.commonValue}>{createDisplayValueJSX(offerValue, tokenUnit)}</p>
          <p className={styles.ltvValue}>{createPercentValueJSX(ltvPercent, '0%')} LTV</p>
        </div>

        <span className={styles.commonValue}>{createPercentValueJSX(apr, '0%')}</span>

        <span className={styles.commonValue}>
          <DisplayValue value={offerSize} />
        </span>
      </div>
    </li>
  )
}

export default Offer
