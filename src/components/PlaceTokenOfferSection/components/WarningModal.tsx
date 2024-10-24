import { FC } from 'react'

import { BN } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import { createDisplayValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { useModal, useTokenType } from '@banx/store/common'
import { formatValueByTokenType, getTokenUnit } from '@banx/utils'

import styles from '../PlaceTokenOfferSection.module.less'

interface WarningModalProps {
  onSubmit: (amount?: BN) => void
  escrowBalance: number
  offerSize: number
}

export const WarningModal: FC<WarningModalProps> = ({ onSubmit, escrowBalance, offerSize }) => {
  const { tokenType } = useTokenType()
  const { close: closeModal } = useModal()

  const tokenUnit = getTokenUnit(tokenType)

  const amountToUpdate = offerSize - escrowBalance

  const formattedEscrowBalance = formatValueByTokenType(escrowBalance, tokenType)
  const formattedOfferSize = formatValueByTokenType(offerSize, tokenType)
  const formattedAmountToUpdate = formatValueByTokenType(amountToUpdate, tokenType)

  const displayEscrowBalance = createDisplayValueJSX(formattedEscrowBalance, tokenUnit)
  const displayOfferSize = createDisplayValueJSX(formattedOfferSize, tokenUnit)
  const displayAmountToUpdate = createDisplayValueJSX(formattedAmountToUpdate, tokenUnit)

  return (
    <Modal className={styles.modal} open onCancel={closeModal} width={496}>
      <h3>Please pay attention!</h3>
      <p>
        You only have {displayEscrowBalance} in escrow instead of {displayOfferSize} size you want
      </p>

      <div className={styles.actionsButtons}>
        <Button
          onClick={() => onSubmit(new BN(amountToUpdate))}
          className={styles.actionButton}
          variant="secondary"
        >
          <span>Deposit {displayAmountToUpdate} to escrow</span>
        </Button>

        <Button onClick={() => onSubmit()} className={styles.actionButton} variant="secondary">
          Update offer
        </Button>
      </div>
    </Modal>
  )
}
