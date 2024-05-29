import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { Pencil } from '@banx/icons'
import { SyntheticOffer, useNftTokenType } from '@banx/store/nft'
import { getTokenUnit } from '@banx/utils'

import styles from './OrderBook.module.less'

interface OfferProps {
  offer: SyntheticOffer
  collectionFloor: number
}

const Offer: FC<OfferProps> = ({ offer }) => {
  const { publicKey: offerPubkey, isEdit, loansAmount } = offer

  const { connected } = useWallet()
  const { tokenType } = useNftTokenType()

  const isNewOffer = connected && offerPubkey === PUBKEY_PLACEHOLDER

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  const displayOfferValue = 0
  const apr = 0

  const tokenUnit = getTokenUnit(tokenType)

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
          {displayOfferValue}
          {tokenUnit}
        </p>
        <p className={styles.value}>{createPercentValueJSX(apr)}</p>
        <p className={styles.value}>{loansAmount}</p>
      </div>
    </li>
  )
}

export default Offer
