import { useEffect, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'
import { NumericStepInput } from '@banx/components/inputs'

import { useWalletBalance } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateClaimLenderVaultTxnDataParams,
  CreateUpdateUserVaultTxnDataParams,
  createClaimLenderVaultTxnData,
  createUpdateUserVaultTxnData,
  parseClaimLenderVaultSimulatedAccounts,
  parseDepositSimulatedAccounts,
} from '@banx/transactions/vault'
import {
  ZERO_BN,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getTokenDecimals,
  getTokenUnit,
  isBanxSolTokenType,
  stringToBN,
} from '@banx/utils'

import { TooltipRow } from '../components'
import { BanxSolEpochContent, EscrowTabs } from './components'
import { useLenderVaultInfo, useUserVault } from './hooks'

import styles from './LenderVaults.module.less'

export const EscrowVault = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { lenderVaultInfo } = useLenderVaultInfo()
  const walletBalance = useWalletBalance(tokenType)

  const [activeTab, setActiveTab] = useState<'wallet' | 'escrow'>('wallet')
  const [inputValue, setInputValue] = useState('0')

  const tokenDecimals = getTokenDecimals(tokenType)

  const formatBalance = (balance: number) => (balance / tokenDecimals).toString()

  useEffect(() => {
    setInputValue(formatBalance(walletBalance))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onTabClick = (nextTab: 'wallet' | 'escrow') => {
    setActiveTab(nextTab)

    const balance = nextTab === 'wallet' ? walletBalance : lenderVaultInfo.offerLiquidityAmount
    setInputValue(formatBalance(balance))
  }

  const update = async (amount: BN) => {
    if (amount.lt(ZERO_BN)) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createUpdateUserVaultTxnData(
        {
          amount,
          lendingTokenType: tokenType,
          add: activeTab === 'wallet',
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
            enqueueSnackbar({
              message: activeTab === 'wallet' ? 'Successfully deposited' : 'Successfully withdrawn',
              type: 'success',
            })
            confirmed.forEach(({ accountInfoByPubkey }) => {
              if (!accountInfoByPubkey) return
              const userVault = parseDepositSimulatedAccounts(accountInfoByPubkey)

              // eslint-disable-next-line no-console
              console.log({ userVault })

              // const offer = parseClaimTokenLenderVaultSimulatedAccounts(accountInfoByPubkey)
              // updateTokenOffer([offer])
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
        additionalData: {
          amount: inputValue,
          lendingTokenType: tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UpdateUserVault',
      })
    }
  }

  const onActionClick = () => {
    update(stringToBN(inputValue, Math.log10(tokenDecimals)))
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>
        Escrow <Tooltip title="Escrow" />
      </h3>

      <EscrowTabs
        tab={activeTab}
        setTab={onTabClick}
        walletBalance={walletBalance}
        escrowBalance={lenderVaultInfo.offerLiquidityAmount}
      />

      <NumericStepInput
        className={styles.numericInput}
        value={inputValue}
        onChange={setInputValue}
        postfix={getTokenUnit(tokenType)}
      />

      <div className={styles.actionWrapper}>
        <Button className={styles.actionButton} onClick={onActionClick} size="medium">
          {activeTab === 'wallet' ? 'Deposit' : 'Withdraw'}
        </Button>
      </div>
    </div>
  )
}

export const ClaimSection = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()
  const { userVault } = useUserVault()

  const { lenderVaultInfo, clusterStats } = useLenderVaultInfo()

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

              //TODO Implement useQuery optimistic
              // eslint-disable-next-line no-console
              console.log(userVault)
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

  return (
    <div className={styles.claimSection}>
      <div
        className={classNames(styles.lenderValtStatsContainer, {
          [styles.hiddenBorder]: !isBanxSolTokenType(tokenType),
        })}
      >
        <div className={styles.lenderVaultStats}>
          <StatInfo
            label="Available to claim"
            tooltipText={tooltipContent}
            value={<DisplayValue value={totalClaimAmount} />}
          />
        </div>
        <Button onClick={claimVault} disabled={!totalClaimAmount} size="medium">
          Claim
        </Button>
      </div>
      {userVault?.lendingTokenType === LendingTokenType.BanxSol && <BanxSolEpochContent />}
    </div>
  )
}
