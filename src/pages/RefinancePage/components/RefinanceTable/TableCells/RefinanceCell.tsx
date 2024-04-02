import React, { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'
import { useWalletModal } from '@banx/components/WalletModal'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_OPTIONS } from '@banx/constants'
import { useAuctionsLoans } from '@banx/pages/RefinancePage/hooks'
import { useModal } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeRefinanceAction } from '@banx/transactions/loans'
import {
  destroySnackbar,
  enqueueSnackbar,
  enqueueTranactionError,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  getDialectAccessToken,
  trackPageEvent,
} from '@banx/utils'

import { useLoansState } from '../hooks'

import styles from '../RefinanceTable.module.less'

interface RefinanceCellProps {
  loan: Loan
  isCardView: boolean
  disabledAction: boolean
}

export const RefinanceCell: FC<RefinanceCellProps> = ({ loan, isCardView, disabledAction }) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()

  const refinance = useRefinanceTransaction(loan)
  const buttonSize = isCardView ? 'default' : 'small'

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (connected) {
      trackPageEvent('refinance', `refinance-lateral`)
      refinance()
    } else {
      toggleVisibility()
    }
    event.stopPropagation()
  }

  return (
    <div className={classNames(styles.refinanceCell, { [styles.cardView]: isCardView })}>
      <Button onClick={onClickHandler} size={buttonSize} disabled={disabledAction}>
        Refinance
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

const useRefinanceTransaction = (loan: Loan) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { addMints } = useAuctionsLoans()
  const { deselectLoan } = useLoansState()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

  const onSuccess = () => {
    if (!getDialectAccessToken(wallet.publicKey?.toBase58())) {
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
    const loadingSnackbarId = uniqueId()

    new TxnExecutor(
      makeRefinanceAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_OPTIONS },
    )
      .addTransactionParam({ loan })
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (failed.length) {
          return enqueueTranactionError()
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            enqueueSnackbar({
              message: 'Loan successfully refinanced',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            addMints(loan.nft.mint)
            deselectLoan(loan.publicKey)
            onSuccess()
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
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
