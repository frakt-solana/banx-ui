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

  const deleteButtonProps = {
    className: classNames(styles.button, styles.deleteOfferButton),
    children: 'Delete offer',
  }

  const updateButtonProps = {
    className: styles.button,
    children: 'Update offer',
  }

  const placeButtonProps = {
    className: styles.button,
    children: !connected ? 'Connect wallet' : 'Place',
  }

  return (
    <div className={styles.buttonsWrapper}>
      {isEdit ? (
        <>
          <Button {...deleteButtonProps} />
          <Button {...updateButtonProps} />
        </>
      ) : (
        <Button {...placeButtonProps} />
      )}
    </div>
  )
}
