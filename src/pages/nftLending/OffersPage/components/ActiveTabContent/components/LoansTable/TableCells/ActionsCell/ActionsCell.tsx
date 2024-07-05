import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { TensorLink } from '@banx/components/SolanaLinks'

import { core } from '@banx/api/nft'
import { useHiddenNftsMints } from '@banx/pages/nftLending/OffersPage'
import { useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { CreateClaimTxnDataParams, createClaimTxnData } from '@banx/transactions/nftLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  isLoanLiquidated,
  isLoanTerminating,
} from '@banx/utils'

import ManageModal from '../../ManageModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: core.Loan
  isCardView?: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView = false }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { open } = useModal()

  const { addMints: hideLoans } = useHiddenNftsMints()

  const onClaim = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createClaimTxnData({ loan }, walletAndConnection)

      await new TxnExecutor<CreateClaimTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
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

          return confirmed.forEach(({ params, signature }) => {
            enqueueSnackbar({
              message: 'Collateral successfully claimed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            hideLoans(params.loan.nft.mint)
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Claim',
      })
    }
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
