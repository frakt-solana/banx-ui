import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { createDisplayValueJSX } from '@banx/components/TableComponents'
import { useUserVault } from '@banx/components/WalletModal'
import { Modal } from '@banx/components/modals/BaseModal'

import { useModal, useTokenType } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateUpdateUserVaultTxnDataParams,
  createUpdateUserVaultTxnData,
  parseDepositSimulatedAccounts,
} from '@banx/transactions/vault'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  formatValueByTokenType,
  getTokenUnit,
} from '@banx/utils'

import styles from '../PlaceTokenOfferSection.module.less'

interface WarningModalProps {
  onSubmit: () => void
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

  const { updateUserVault } = useUpdateUserVault()

  return (
    <Modal className={styles.modal} open onCancel={closeModal} width={496}>
      <h3>Please pay attention!</h3>
      <p>
        You only have {displayEscrowBalance} in escrow instead of {displayOfferSize} size you want.
        Your offer may be updated to {displayOfferSize} later after repayments.
      </p>

      <div className={styles.actionsButtons}>
        <Button
          onClick={() => updateUserVault(new BN(amountToUpdate))}
          className={styles.actionButton}
          variant="secondary"
        >
          <span>Deposit {displayAmountToUpdate} to escrow</span>
        </Button>

        <Button onClick={onSubmit} className={styles.actionButton} variant="secondary">
          Update offer
        </Button>
      </div>
    </Modal>
  )
}

const useUpdateUserVault = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()
  const { close: closeModal } = useModal()

  const { updateUserVaultOptimistic } = useUserVault()

  const updateUserVault = async (amount: BN) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createUpdateUserVaultTxnData(
        {
          amount,
          lendingTokenType: tokenType,
          add: true,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateUpdateUserVaultTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Successfully deposited', type: 'success' })

            confirmed.forEach(({ accountInfoByPubkey }) => {
              if (!accountInfoByPubkey) return
              const userVault = parseDepositSimulatedAccounts(accountInfoByPubkey)

              updateUserVaultOptimistic({
                walletPubkey: walletAndConnection.wallet.publicKey.toBase58(),
                updatedUserVault: userVault,
              })
            })

            closeModal()
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: {
          amount: amount.toNumber(),
          lendingTokenType: tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UpdateUserVault',
      })
    }
  }

  return { updateUserVault }
}
