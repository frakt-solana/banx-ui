import { FC, useEffect, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { DisplayValue } from '@banx/components/TableComponents'
import { NumericStepInput } from '@banx/components/inputs'

import { useWalletBalance } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateDepositUserVaultTxnDataParams,
  createDepositUserVaultTxnData,
  parseDepositSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  ZERO_BN,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getTokenDecimals,
  getTokenUnit,
  stringToBN,
} from '@banx/utils'

import { useLenderVaultInfo } from './hooks'

import styles from './LenderVaults.module.less'

export const EscrowVault = () => {
  const { tokenType } = useTokenType()
  const walletBalance = useWalletBalance(tokenType, { isLive: false })
  const { lenderVaultInfo } = useLenderVaultInfo()
  const wallet = useWallet()
  const { connection } = useConnection()

  const [activeTab, setActiveTab] = useState<'wallet' | 'escrow'>('wallet')

  const [inputValue, setInputValue] = useState('0')

  const tokenDecimals = getTokenDecimals(tokenType)

  useEffect(() => {
    const valueString = (walletBalance / getTokenDecimals(tokenType)).toString()
    setInputValue(valueString)
  }, [tokenType, walletBalance])

  const onTabClick = (nextValue: 'wallet' | 'escrow') => {
    setActiveTab(nextValue)

    const value = nextValue === 'wallet' ? walletBalance : lenderVaultInfo.totalLiquidityValue

    const valueString = (value / getTokenDecimals(tokenType)).toString()

    setInputValue(valueString)
  }

  const deposit = async (amount: BN) => {
    if (amount.lt(ZERO_BN)) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createDepositUserVaultTxnData(
        {
          amount,
          lendingTokenType: tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateDepositUserVaultTxnDataParams>(walletAndConnection, {
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
        transactionName: 'DepositUserVault',
      })
    }
  }

  const onActionClick = () => {
    if (activeTab === 'wallet') {
      deposit(stringToBN(inputValue, Math.log10(tokenDecimals)))
      //addLiquidityToUserVault

      return
    }

    //createClaimLenderVaultTxnData
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Lender escrow</h3>

      <EscrowTabs
        tab={activeTab}
        setTab={onTabClick}
        walletBalance={walletBalance}
        escrowBalance={lenderVaultInfo.totalLiquidityValue}
      />

      <NumericStepInput
        className={styles.numbericInput}
        value={inputValue}
        onChange={setInputValue}
        // className={styles.maxOfferInput}
        // disabled={!connected}
        // tooltipText="Your max offer, given sufficient liquidity in your offer. Actual loan amount taken can be less depending on the amount of SOL borrowers choose to borrow"
        postfix={getTokenUnit(tokenType)}
        // step={inputStepByTokenType}
      />

      <div className={styles.actionWrapper}>
        <Button
          className={styles.actionButton}
          onClick={onActionClick}
          disabled={false}
          size="medium"
        >
          {activeTab === 'wallet' ? 'Deposit' : 'Claim'}
        </Button>
      </div>
    </div>
  )
}

type EscrowTabsProps = {
  walletBalance: number
  escrowBalance: number
  tab: 'wallet' | 'escrow'
  setTab: (tab: 'wallet' | 'escrow') => void
}
const EscrowTabs: FC<EscrowTabsProps> = ({ tab, setTab, escrowBalance, walletBalance }) => {
  return (
    <div className={styles.tabs}>
      <EscrowTab
        label="Wallet balance"
        balance={walletBalance}
        isActive={tab === 'wallet'}
        onClick={() => setTab('wallet')}
      />
      <EscrowTab
        label="Escrow balance"
        balance={escrowBalance}
        isActive={tab === 'escrow'}
        onClick={() => setTab('escrow')}
      />
    </div>
  )
}

type EscrowTabProps = {
  label: string
  balance: number
  isActive?: boolean
  onClick: () => void
}
const EscrowTab: FC<EscrowTabProps> = ({ label, balance, onClick, isActive }) => {
  return (
    <div className={classNames(styles.tab, { [styles.tabActive]: isActive })} onClick={onClick}>
      <p className={styles.tabBalance}>
        <DisplayValue value={balance} />
      </p>
      <p className={styles.tabLabel}>{label}</p>
    </div>
  )
}

// export const TokenLenderVault = () => {
//   const wallet = useWallet()
//   const { connection } = useConnection()
//   const { tokenType } = useTokenType()

//   const { isLedger } = useIsLedger()
//   const { userVault } = useUserVault()

//   const { offers, lenderVaultInfo, updateTokenOffer, clusterStats } = useLenderVaultInfo()

//   const claimVault = async () => {
//     if (!offers.length) return

//     const loadingSnackbarId = uniqueId()

//     try {
//       const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

//       const txnsData = await Promise.all(
//         offers.map((offer) =>
//           createClaimLenderVaultTxnData(
//             { userVault, offer, tokenType, clusterStats },
//             walletAndConnection,
//           ),
//         ),
//       )

//       await new TxnExecutor<CreateClaimLenderVaultTxnDataParams>(walletAndConnection, {
//         ...TXN_EXECUTOR_DEFAULT_OPTIONS,
//         chunkSize: isLedger ? 5 : 40,
//       })
//         .addTxnsData(txnsData)
//         .on('sentAll', () => {
//           enqueueTransactionsSent()
//           enqueueWaitingConfirmation(loadingSnackbarId)
//         })
//         .on('confirmedAll', (results) => {
//           const { confirmed, failed } = results

//           destroySnackbar(loadingSnackbarId)

//           if (confirmed.length) {
//             enqueueSnackbar({ message: 'Successfully claimed', type: 'success' })
//             confirmed.forEach(({ accountInfoByPubkey }) => {
//               if (!accountInfoByPubkey) return
//               const offer = parseClaimTokenLenderVaultSimulatedAccounts(accountInfoByPubkey)
//               updateTokenOffer([offer])
//             })
//           }

//           if (failed.length) {
//             return failed.forEach(({ signature, reason }) =>
//               enqueueConfirmationError(signature, reason),
//             )
//           }
//         })
//         .on('error', (error) => {
//           throw error
//         })
//         .execute()
//     } catch (error) {
//       destroySnackbar(loadingSnackbarId)
//       defaultTxnErrorHandler(error, {
//         additionalData: offers,
//         walletPubkey: wallet?.publicKey?.toBase58(),
//         transactionName: 'ClaimLenderVault',
//       })
//     }
//   }

//   const {
//     totalAccruedInterest,
//     totalRepaymets,
//     totalLstYield,
//     totalLiquidityValue,
//     totalClaimableValue,
//     totalFundsInCurrentEpoch,
//     totalFundsInNextEpoch,
//   } = lenderVaultInfo

//   const tooltipContent = (
//     <div className={styles.tooltipContent}>
//       <TooltipRow label="Repayments" value={totalRepaymets} />
//       <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
//     </div>
//   )

//   return (
//     <div className={styles.lenderVaultContainer}>
//       {isBanxSolTokenType(tokenType) && (
//         <BanxSolEpochContent
//           currentEpochYield={totalFundsInCurrentEpoch}
//           nextEpochYield={totalFundsInNextEpoch}
//           tokenType={tokenType}
//         />
//       )}
//       <div
//         className={classNames(styles.lenderValtStatsContainer, {
//           [styles.hiddenBorder]: !isBanxSolTokenType(tokenType),
//         })}
//       >
//         <div className={styles.lenderVaultStats}>
//           <StatInfo
//             label="Liquidity"
//             tooltipText={tooltipContent}
//             value={<DisplayValue value={totalLiquidityValue} />}
//           />
//           {isBanxSolTokenType(tokenType) && (
//             <YieldStat totalYield={totalLstYield} tokenType={tokenType} />
//           )}
//         </div>
//         <Button onClick={claimVault} disabled={!totalClaimableValue} size="medium">
//           Claim
//         </Button>
//       </div>
//     </div>
//   )
// }

// export const NftLenderVault = () => {
//   const wallet = useWallet()
//   const { connection } = useConnection()
//   const { tokenType } = useTokenType()

//   const { isLedger } = useIsLedger()
//   const { userVault } = useUserVault()

//   const { offers, lenderVaultInfo, updateNftOffer, clusterStats } = useLenderVaultInfo()

//   const {
//     totalAccruedInterest,
//     totalRepaymets,
//     totalLstYield,
//     totalLiquidityValue,
//     totalClaimableValue,
//     totalFundsInCurrentEpoch,
//     totalFundsInNextEpoch,
//   } = lenderVaultInfo

//   const claimVault = async () => {
//     if (!offers.length) return

//     const loadingSnackbarId = uniqueId()

//     try {
//       const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

//       const txnsData = await Promise.all(
//         offers.map((offer) =>
//           createClaimLenderVaultTxnData(
//             { userVault, offer, tokenType, clusterStats },
//             walletAndConnection,
//           ),
//         ),
//       )

//       await new TxnExecutor<CreateClaimLenderVaultTxnDataParams>(walletAndConnection, {
//         ...TXN_EXECUTOR_DEFAULT_OPTIONS,
//         chunkSize: isLedger ? 5 : 40,
//       })
//         .addTxnsData(txnsData)
//         .on('sentAll', () => {
//           enqueueTransactionsSent()
//           enqueueWaitingConfirmation(loadingSnackbarId)
//         })
//         .on('confirmedAll', (results) => {
//           const { confirmed, failed } = results

//           destroySnackbar(loadingSnackbarId)

//           if (confirmed.length) {
//             enqueueSnackbar({ message: 'Successfully claimed', type: 'success' })
//             confirmed.forEach(({ accountInfoByPubkey }) => {
//               if (!accountInfoByPubkey) return
//               const offer = parseClaimLenderVaultSimulatedAccounts(accountInfoByPubkey)
//               updateNftOffer([offer])
//             })
//           }

//           if (failed.length) {
//             return failed.forEach(({ signature, reason }) =>
//               enqueueConfirmationError(signature, reason),
//             )
//           }
//         })
//         .on('error', (error) => {
//           throw error
//         })
//         .execute()
//     } catch (error) {
//       destroySnackbar(loadingSnackbarId)
//       defaultTxnErrorHandler(error, {
//         additionalData: offers,
//         walletPubkey: wallet?.publicKey?.toBase58(),
//         transactionName: 'ClaimLenderVault',
//       })
//     }
//   }

//   const tooltipContent = (
//     <div className={styles.tooltipContent}>
//       <TooltipRow label="Repayments" value={totalRepaymets} />
//       <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
//     </div>
//   )

//   return (
//     <div className={styles.lenderVaultContainer}>
//       {isBanxSolTokenType(tokenType) && (
//         <BanxSolEpochContent
//           currentEpochYield={totalFundsInCurrentEpoch}
//           nextEpochYield={totalFundsInNextEpoch}
//           tokenType={tokenType}
//         />
//       )}

//       <div
//         className={classNames(styles.lenderValtStatsContainer, {
//           [styles.hiddenBorder]: !isBanxSolTokenType(tokenType),
//         })}
//       >
//         <div className={styles.lenderVaultStats}>
//           <StatInfo
//             label="Liquidity"
//             tooltipText={tooltipContent}
//             value={<DisplayValue value={totalLiquidityValue} />}
//           />
//           {isBanxSolTokenType(tokenType) && (
//             <YieldStat totalYield={totalLstYield} tokenType={tokenType} />
//           )}
//         </div>
//         <Button onClick={claimVault} disabled={!totalClaimableValue} size="medium">
//           Claim
//         </Button>
//       </div>
//     </div>
//   )
// }
