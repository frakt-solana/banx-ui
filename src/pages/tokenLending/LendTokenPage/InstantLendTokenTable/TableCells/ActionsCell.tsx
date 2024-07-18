import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { useWalletModal } from '@banx/components/WalletModal'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { useModal } from '@banx/store/common'
import { formatCollateralTokenValue, getTokenLoanSupply, isTokenLoanFrozen } from '@banx/utils'

import { useInstantTokenTransactions } from '../hooks'

import styles from '../InstantLendTokenTable.module.less'

interface ActionsCellProps {
  loan: core.TokenLoan
  isCardView: boolean
  disabledAction: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView, disabledAction }) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()
  const { lendToBorrow } = useInstantTokenTransactions()

  const { open } = useModal()

  const showModal = () => {
    open(WarningModal, { loan, lendToBorrow })
  }

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (!connected) {
      return toggleVisibility()
    }

    if (isTokenLoanFrozen(loan)) {
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
    </div>
  )
}

interface WarningModalProps {
  loan: core.TokenLoan
  lendToBorrow: (loan: core.TokenLoan) => void
}

const WarningModal: FC<WarningModalProps> = ({ loan, lendToBorrow }) => {
  const { close } = useModal()

  const collateralSupply = formatCollateralTokenValue(getTokenLoanSupply(loan))
  const collateralTicker = loan.collateral.ticker

  const terminateFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY

  const displayCollateralName = `${collateralSupply} ${collateralTicker}`

  return (
    <Modal className={styles.modal} open onCancel={close} width={496}>
      <h3>Please pay attention!</h3>
      <p>
        Are you sure you want to fund the loan against{' '}
        <span className={styles.collateralName}>{displayCollateralName}</span> for{' '}
        {terminateFreezeInDays} days with no termination option?
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
