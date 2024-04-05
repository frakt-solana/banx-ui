import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useHiddenNftsMints } from '@banx/pages/OffersPage'
import { useModal, usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimAction } from '@banx/transactions/loans'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  isLoanLiquidated,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import { ManageModal } from './ManageModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView?: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView = false }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()
  const { open } = useModal()

  const { addMints: hideLoans } = useHiddenNftsMints()

  const onClaim = () => {
    trackPageEvent('myoffers', 'activetab-claim')

    const loadingSnackbarId = uniqueId()

    new TxnExecutor(
      makeClaimAction,
      { wallet: createWalletInstance(wallet), connection },
      {
        confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS,
      },
    )
      .addTransactionParam({ loan, priorityFeeLevel: priorityLevel })
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            enqueueSnackbar({
              message: 'Collateral successfully claimed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            hideLoans(loan.nft.mint)
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim',
        })
      })
      .execute()
  }

  const buttonSize = isCardView ? 'default' : 'small'

  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  const canClaim = isLoanExpired && isTerminatingStatus

  const showModal = () => {
    open(ManageModal, {
      loan,
    })
  }

  return (
    <div className={styles.actionsButtons}>
      {canClaim && (
        <Button className={styles.actionButton} onClick={onClaim} size={buttonSize}>
          Claim NFT
        </Button>
      )}
      {!canClaim && (
        <Button
          className={styles.actionButton}
          onClick={(event) => {
            showModal()
            event.stopPropagation()
          }}
          disabled={isTerminatingStatus}
          variant="secondary"
          size={buttonSize}
        >
          Manage
        </Button>
      )}
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
