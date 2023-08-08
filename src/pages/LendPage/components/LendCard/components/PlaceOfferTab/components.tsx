import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import styles from './PlaceOfferTab.module.less'

export const OfferSummary = () => (
  <div className={styles.offerSummary}>
    <StatInfo label="Offer size" value="10" flexType="row" />
    <StatInfo label="Estimated interest" value="1" flexType="row" />
  </div>
)

export const OfferHeader = () => {
  return (
    <div className={styles.flexRow}>
      <h4 className={styles.title}>Offer creation</h4>
    </div>
  )
}

export const OfferActionButtons = () => {
  const isEdit = false // TODO: remove it

  const { connected } = useWallet()

  return (
    <div className={styles.buttonsWrapper}>
      {isEdit ? (
        <>
          <Button className={classNames(styles.button, styles.deleteOfferButton)}>
            Delete offer
          </Button>
          <Button className={styles.button}>Update offer</Button>
        </>
      ) : (
        <Button className={styles.button}>{!connected ? 'Connect wallet' : 'Place'}</Button>
      )}
    </div>
  )
}
