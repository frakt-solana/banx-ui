import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'
import { useWalletModal } from '@banx/components/WalletModal'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { SECONDS_IN_DAY } from '@banx/constants'
import { useModal } from '@banx/store'
import { isLoanListed } from '@banx/utils'

import { useInstantTransactions } from '../hooks'

import styles from '../InstantLendTable.module.less'

interface RefinanceCellProps {
  loan: Loan
  isCardView: boolean
  disabledAction: boolean
}

export const ActionsCell: FC<RefinanceCellProps> = ({ loan, isCardView, disabledAction }) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()
  const { lendToBorrow } = useInstantTransactions()

  const { open } = useModal()

  const showModal = () => {
    open(WarningModal, { loan, lendToBorrow })
  }

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (!connected) {
      return toggleVisibility()
    }

    if (isLoanListed(loan)) {
      return showModal()
    }

    return lendToBorrow(loan)
  }

  return (
    <div className={classNames(styles.actionsCell, { [styles.cardView]: isCardView })}>
      <Button
        className={styles.actionButton}
        onClick={onClickHandler}
        size={isCardView ? 'default' : 'small'}
        disabled={disabledAction}
      >
        Lend
      </Button>
      <Button
        className={classNames(styles.tensorButtonLink, { [styles.cardView]: isCardView })}
        variant="secondary"
        type="circle"
        size="small"
      >
        <TensorLink mint={loan.nft.mint} />
      </Button>
    </div>
  )
}

interface WarningModalProps {
  loan: Loan
  lendToBorrow: (loan: Loan) => void
}

const WarningModal: FC<WarningModalProps> = ({ loan, lendToBorrow }) => {
  const { close } = useModal()

  const nftName = loan.nft.meta.name

  const terminateFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY

  return (
    <Modal className={styles.modal} open onCancel={close} width={496}>
      <h3>Please pay attention!</h3>
      <p>
        Are you sure you want to fund the loan against{' '}
        <span className={styles.nftName}>{nftName}</span> for {terminateFreezeInDays} days with no
        termination option?
      </p>
      <div className={styles.actionsButtons}>
        <Button onClick={close} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={() => lendToBorrow(loan)} className={styles.confirmButton}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
