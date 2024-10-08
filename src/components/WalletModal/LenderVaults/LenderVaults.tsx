import { FC, useEffect, useState } from 'react'

import { CaretRightOutlined } from '@ant-design/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
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
  CreateClaimLenderVaultTxnDataParams,
  CreateUpdateUserVaultTxnDataParams,
  createClaimLenderVaultTxnData,
  createUpdateUserVaultTxnData,
  parseClaimLenderVaultSimulatedAccounts,
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
  isBanxSolTokenType,
  stringToBN,
} from '@banx/utils'

import { TooltipRow } from '../components'
import { useLenderVaultInfo, useUserVault } from './hooks'

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

    const value = nextValue === 'wallet' ? walletBalance : lenderVaultInfo.offerLiquidityAmount

    const valueString = (value / getTokenDecimals(tokenType)).toString()

    setInputValue(valueString)
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
    update(stringToBN(inputValue, Math.log10(tokenDecimals)))
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Lender escrow</h3>

      <EscrowTabs
        tab={activeTab}
        setTab={onTabClick}
        walletBalance={walletBalance}
        escrowBalance={lenderVaultInfo.offerLiquidityAmount}
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
          {activeTab === 'wallet' ? 'Deposit' : 'Withdraw'}
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
  const onChange = () => {
    if (tab === 'wallet') setTab('escrow')
    else setTab('wallet')
  }

  return (
    <div className={styles.tabs} onClick={onChange}>
      <EscrowTab
        label="Wallet balance"
        balance={walletBalance}
        isActive={tab === 'wallet'}
        onClick={() => setTab('wallet')}
      />
      <div className={classNames(styles.arrow, { [styles.arrowIconRotated]: tab === 'escrow' })}>
        <CaretRightOutlined className={styles.arrowIcon} />
      </div>
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

export const ClaimSection = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()
  const { userVault } = useUserVault()

  const { lenderVaultInfo, clusterStats } = useLenderVaultInfo()

  const { totalClaimAmount } = lenderVaultInfo

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

  const { repaymentsAmount, interestRewardsAmount, rentRewards } = lenderVaultInfo

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
    </div>
  )
}
