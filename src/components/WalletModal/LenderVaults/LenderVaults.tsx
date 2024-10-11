import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'
import { InputErrorMessage, NumericStepInput } from '@banx/components/inputs'

import { useTokenType } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateClaimLenderVaultTxnDataParams,
  createClaimLenderVaultTxnData,
  parseClaimLenderVaultSimulatedAccounts,
} from '@banx/transactions/vault'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getTokenUnit,
  isBanxSolTokenType,
} from '@banx/utils'

import { TooltipRow } from '../components'
import { BanxSolEpochContent, EscrowTabs } from './components'
import { TabName, useLenderVaultInfo, useUserVaultContent } from './hooks'

import styles from './LenderVaults.module.less'

export const EscrowVault = () => {
  const {
    inputValue,
    setInputValue,
    activeTab,
    onTabClick,
    onActionClick,
    walletBalance,
    escrowBalance,
    errorMessage,
    tokenType,
  } = useUserVaultContent()

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>
        Escrow
        <Tooltip title="With escrow, lenders can make an unlimited number of offers, as long as each offer doesn’t exceed the escrow balance" />
      </h3>

      <EscrowTabs
        tab={activeTab}
        setTab={onTabClick}
        walletBalance={walletBalance}
        escrowBalance={escrowBalance}
      />

      <NumericStepInput
        value={inputValue}
        onChange={setInputValue}
        postfix={getTokenUnit(tokenType)}
      />

      <div className={styles.errorMessageContainer}>
        {errorMessage && <InputErrorMessage message={errorMessage} />}
      </div>

      <div className={styles.actionWrapper}>
        <Button
          className={styles.actionButton}
          onClick={onActionClick}
          size="medium"
          disabled={!!errorMessage || parseFloat(inputValue) === 0}
        >
          {activeTab === TabName.Wallet ? 'Deposit' : 'Withdraw'}
        </Button>
      </div>
    </div>
  )
}

export const ClaimSection = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { userVault, updateUserVaultOptimistic, lenderVaultInfo, clusterStats } =
    useLenderVaultInfo()

  const { totalClaimAmount, repaymentsAmount, interestRewardsAmount, rentRewards } = lenderVaultInfo

  const claimVault = async () => {
    if (totalClaimAmount <= 0 || !userVault || !clusterStats) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createClaimLenderVaultTxnData(
        { userVault, clusterStats },
        walletAndConnection,
      )

      await new TxnExecutor<CreateClaimLenderVaultTxnDataParams>(walletAndConnection, {
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
            enqueueSnackbar({ message: 'Successfully claimed', type: 'success' })
            confirmed.forEach(({ accountInfoByPubkey }) => {
              if (!accountInfoByPubkey) return
              const userVault = parseClaimLenderVaultSimulatedAccounts(accountInfoByPubkey)

              updateUserVaultOptimistic({
                walletPubkey: walletAndConnection.wallet.publicKey.toBase58(),
                updatedUserVault: userVault,
              })
            })
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
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimLenderVault',
      })
    }
  }

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Repayments" value={repaymentsAmount} />
      <TooltipRow label="Accrued interest" value={interestRewardsAmount} />
      <TooltipRow label="Rent rewards" value={rentRewards} />
      {isBanxSolTokenType(tokenType) && <TooltipRow label="Total LST Yield" value={rentRewards} />}
    </div>
  )

  const isBanxSol = userVault?.lendingTokenType === LendingTokenType.BanxSol

  return (
    <div className={styles.claimSection}>
      <div
        className={classNames(styles.lenderValtStatsContainer, {
          [styles.epochContent]: isBanxSol,
        })}
      >
        <div className={styles.lenderVaultStats}>
          {isBanxSol && <BanxSolEpochContent />}
          <StatInfo
            label="Available to claim"
            tooltipText={tooltipContent}
            value={<DisplayValue value={totalClaimAmount} />}
            flexType="row"
          />
        </div>
        <Button onClick={claimVault} disabled={!totalClaimAmount} size="medium">
          Claim
        </Button>
      </div>
    </div>
  )
}
