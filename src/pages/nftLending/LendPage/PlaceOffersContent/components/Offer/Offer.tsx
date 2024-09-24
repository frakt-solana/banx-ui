import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { createDisplayValueJSX, createPercentValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { Pencil } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { SyntheticOffer } from '@banx/store/nft'
import { calculateApr, formatValueByTokenType, getTokenUnit } from '@banx/utils'

import styles from './Offer.module.less'

interface OfferProps {
  offer: SyntheticOffer
  editOffer: () => void
  collectionFloor: number
}

const Offer: FC<OfferProps> = ({ editOffer, offer, collectionFloor }) => {
  const {
    publicKey: offerPubkey,
    isEdit,
    loansAmount,
    loanValue,
    assetReceiver,
    marketPubkey,
  } = offer

  const { connected, publicKey } = useWallet()
  const { tokenType } = useTokenType()

  const isOwnOffer = assetReceiver === publicKey?.toBase58()
  const isNewOffer = connected && offerPubkey === PUBKEY_PLACEHOLDER
  const showEditOfferButton = isOwnOffer && !isNewOffer

  const commonHighlightClassNames = {
    [styles.creating]: isNewOffer,
    [styles.editing]: isEdit,
    [styles.hidden]: !isEdit && !isNewOffer,
  }

  const displayOfferValue = getDisplayOfferRange(offer, tokenType)
  const maxDynamicApr = calculateApr({ loanValue, collectionFloor, marketPubkey }) / 100

  const tokenUnit = getTokenUnit(tokenType)

  return (
    <li className={classNames(styles.listItem, commonHighlightClassNames)}>
      <div className={classNames(styles.highlightItem, commonHighlightClassNames)}>
        <Pencil />
      </div>

      <div className={styles.values}>
        <p className={styles.displayOfferValue}>
          {createDisplayValueJSX(displayOfferValue, tokenUnit)}
        </p>
        <p className={styles.value}>{createPercentValueJSX(maxDynamicApr)}</p>
        <p className={styles.value}>{loansAmount}</p>
      </div>

      {showEditOfferButton && <EditOfferButton onClick={editOffer} />}
    </li>
  )
}

export default Offer

const EditOfferButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    onClick={onClick}
    type="circle"
    variant="secondary"
    size="medium"
    className={styles.editButton}
  >
    <Tooltip title="Edit">
      <div className={styles.tooltipInnerContent}>
        <Pencil />
      </div>
    </Tooltip>
  </Button>
)

const getDisplayOfferRange = (offer: SyntheticOffer, tokenType: LendingTokenType) => {
  const { loanValue, loansAmount, deltaValue } = offer

  const minDeltaValue = loanValue - (loansAmount - 1) * deltaValue

  const formattedLoanValue = formatValueByTokenType(loanValue, tokenType)
  const formattedMinLoanValue = formatValueByTokenType(minDeltaValue, tokenType)

  const displayOfferRange = deltaValue
    ? `${formattedLoanValue} - ${formattedMinLoanValue}`
    : formattedLoanValue

  return displayOfferRange || '0'
}
