import React, { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { Button } from '@banx/components/Buttons'
import { SolanaFMLink } from '@banx/components/SolanaLinks'
import { useWalletModal } from '@banx/components/WalletModal'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { Loan } from '@banx/api/core'
import { useAuctionsLoans } from '@banx/pages/RefinancePage/hooks'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRefinanceAction } from '@banx/transactions/loans'
import { enqueueSnackbar, getDialectAccessToken } from '@banx/utils'

import { useLoansState } from '../hooks'

import styles from '../RefinanceTable.module.less'

interface RefinanceCellProps {
  loan: Loan
  isCardView: boolean
}

export const RefinanceCell: FC<RefinanceCellProps> = ({ loan, isCardView }) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()

  const refinance = useRefinanceTransaction(loan)
  const buttonSize = isCardView ? 'large' : 'small'

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (connected) {
      refinance()
    } else {
      toggleVisibility()
    }
    event.stopPropagation()
  }

  return (
    <div className={classNames(styles.refinanceCell, { [styles.cardView]: isCardView })}>
      <Button onClick={onClickHandler} size={buttonSize}>
        Refinance
      </Button>
      <SolanaFMLink
        className={classNames(styles.solanaNftButton, { [styles.isCardView]: isCardView })}
        path={`address/${loan.nft.mint}`}
        size={buttonSize}
      />
    </div>
  )
}

const useRefinanceTransaction = (loan: Loan) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { addMints } = useAuctionsLoans()
  const { deselectLoan } = useLoansState()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

  const onSuccess = () => {
    if (!getDialectAccessToken()) {
      open(SubscribeNotificationsModal, {
        title: createRefinanceSubscribeNotificationsTitle(1),
        message: createRefinanceSubscribeNotificationsContent(),
        onActionClick: () => {
          close()
          setBanxNotificationsSiderVisibility(true)
        },
        onCancel: close,
      })
    }
  }

  const refinance = () => {
    new TxnExecutor(makeRefinanceAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        addMints(loan.nft.mint)
        deselectLoan(loan.publicKey)
        enqueueSnackbar({
          message: 'Loan successfully refinanced',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
        onSuccess()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Refinance',
        })
      })
      .execute()
  }

  return refinance
}
