import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { useIsLedger, useTokenType } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateClaimLenderVaultTxnDataParams,
  createClaimLenderVaultTxnData,
  parseClaimLenderVaultSimulatedAccounts,
  parseClaimTokenLenderVaultSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  isBanxSolTokenType,
} from '@banx/utils'

import { TooltipRow } from '../components'
import { BanxSolEpochContent, YieldStat } from './components'
import { useLenderVaultInfo } from './hooks'

import styles from '../WalletModal.module.less'

export const TokenLenderVault = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { isLedger } = useIsLedger()

  const { offers, lenderVaultInfo, updateTokenOffer, clusterStats } = useLenderVaultInfo()

  const claimVault = async () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        offers.map((offer) =>
          createClaimLenderVaultTxnData({ offer, tokenType, clusterStats }, walletAndConnection),
        ),
      )

      await new TxnExecutor<CreateClaimLenderVaultTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
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
              const offer = parseClaimTokenLenderVaultSimulatedAccounts(accountInfoByPubkey)
              updateTokenOffer([offer])
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
        additionalData: offers,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimLenderVault',
      })
    }
  }

  const {
    totalAccruedInterest,
    totalRepaymets,
    totalLstYield,
    totalClosedOffersValue,
    totalLiquidityValue,
    totalClaimableValue,
    totalFundsInCurrentEpoch,
    totalFundsInNextEpoch,
  } = lenderVaultInfo

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Repayments" value={totalRepaymets} />
      <TooltipRow label="Closed offers" value={totalClosedOffersValue} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
    </div>
  )

  return (
    <div className={styles.lenderVaultContainer}>
      {isBanxSolTokenType(tokenType) && (
        <BanxSolEpochContent
          currentEpochYield={totalFundsInCurrentEpoch}
          nextEpochYield={totalFundsInNextEpoch}
          tokenType={tokenType}
        />
      )}
      <div
        className={classNames(styles.lenderValtStatsContainer, {
          [styles.hiddenBorder]: !isBanxSolTokenType(tokenType),
        })}
      >
        <div className={styles.lenderVaultStats}>
          <StatInfo
            label="Liquidity"
            tooltipText={tooltipContent}
            value={<DisplayValue value={totalLiquidityValue} />}
          />
          {isBanxSolTokenType(tokenType) && (
            <YieldStat totalYield={totalLstYield} tokenType={tokenType} />
          )}
        </div>
        <Button onClick={claimVault} disabled={!totalClaimableValue} size="medium">
          Claim
        </Button>
      </div>
    </div>
  )
}

export const NftLenderVault = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { isLedger } = useIsLedger()

  const { offers, lenderVaultInfo, updateNftOffer, clusterStats } = useLenderVaultInfo()

  const {
    totalAccruedInterest,
    totalRepaymets,
    totalLstYield,
    totalClosedOffersValue,
    totalLiquidityValue,
    totalClaimableValue,
    totalFundsInCurrentEpoch,
    totalFundsInNextEpoch,
  } = lenderVaultInfo

  const claimVault = async () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        offers.map((offer) =>
          createClaimLenderVaultTxnData({ offer, tokenType, clusterStats }, walletAndConnection),
        ),
      )

      await new TxnExecutor<CreateClaimLenderVaultTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
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
              const offer = parseClaimLenderVaultSimulatedAccounts(accountInfoByPubkey)
              updateNftOffer([offer])
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
        additionalData: offers,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimLenderVault',
      })
    }
  }

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Repayments" value={totalRepaymets} />
      <TooltipRow label="Closed offers" value={totalClosedOffersValue} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
    </div>
  )

  return (
    <div className={styles.lenderVaultContainer}>
      {isBanxSolTokenType(tokenType) && (
        <BanxSolEpochContent
          currentEpochYield={totalFundsInCurrentEpoch}
          nextEpochYield={totalFundsInNextEpoch}
          tokenType={tokenType}
        />
      )}

      <div
        className={classNames(styles.lenderValtStatsContainer, {
          [styles.hiddenBorder]: !isBanxSolTokenType(tokenType),
        })}
      >
        <div className={styles.lenderVaultStats}>
          <StatInfo
            label="Liquidity"
            tooltipText={tooltipContent}
            value={<DisplayValue value={totalLiquidityValue} />}
          />
          {isBanxSolTokenType(tokenType) && (
            <YieldStat totalYield={totalLstYield} tokenType={tokenType} />
          )}
        </div>
        <Button onClick={claimVault} disabled={!totalClaimableValue} size="medium">
          Claim
        </Button>
      </div>
    </div>
  )
}
