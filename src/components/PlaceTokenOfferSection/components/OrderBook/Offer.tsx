import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { Pencil } from '@banx/icons'
import { useNftTokenType } from '@banx/store/nft'
import { SyntheticTokenOffer } from '@banx/store/token'
import { getTokenDecimals } from '@banx/utils'

import styles from './OrderBook.module.less'

interface OfferProps {
  offer: SyntheticTokenOffer
}

const Offer: FC<OfferProps> = ({ offer }) => {
  const { publicKey: offerPubkey, collateralsPerToken, offerSize, isEdit } = offer

  const { connected } = useWallet()
  const { tokenType } = useNftTokenType()

  const tokenDesimals = getTokenDecimals(tokenType)

  const isNewOffer = connected && offerPubkey === PUBKEY_PLACEHOLDER

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  //TODO (TokenLending): Use rateBasePoints from market or calculate dynamically?
  const apr = 0

  const offerValue = collateralsPerToken / tokenDesimals || 0

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
        <p className={styles.value}>{createPercentValueJSX(apr)}</p>
        <p className={styles.value}>
          <DisplayValue value={offerSize} />
        </p>
      </div>
    </li>
  )
}

export default Offer
