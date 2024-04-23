import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'
import { useWalletModal } from '@banx/components/WalletModal'

import { Loan } from '@banx/api/core'

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
  const { refinance } = useInstantTransactions()

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (connected) {
      refinance(loan)
    } else {
      toggleVisibility()
    }
    event.stopPropagation()
  }

  return (
    <div className={classNames(styles.actionsCell, { [styles.cardView]: isCardView })}>
      <Button
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
