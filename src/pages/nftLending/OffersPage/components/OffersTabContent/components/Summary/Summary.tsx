import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { EpochProgressBar } from '@banx/components/EpochProgressBar'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { getLenderVaultInfo } from '@banx/components/WalletModal'

import { Offer, core } from '@banx/api/nft'
import { useClusterStats } from '@banx/hooks'
import { BanxSOL } from '@banx/icons'
import { useTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createClaimLenderVaultTxnData } from '@banx/transactions/nftLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  formatValueByTokenType,
  isBanxSolTokenType,
} from '@banx/utils'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddOffer: (offer: core.Offer[]) => void
  offers: core.UserOffer[]
}

const Summary: FC<SummaryProps> = ({ updateOrAddOffer, offers }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { tokenType } = useTokenType()

  const { data: clusterStats } = useClusterStats()

  const claimVault = async () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        offers.map(({ offer }) =>
          createClaimLenderVaultTxnData({
            offer,
            walletAndConnection,
            tokenType,
            clusterStats,
          }),
        ),
      )

      await new TxnExecutor<Offer>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
            confirmed.forEach(({ result }) => result && updateOrAddOffer([result]))
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
    totalLstYeild,
    totalClosedOffersValue,
    totalClaimableValue,
    totalFundsInCurrentEpoch,
    totalFundsInNextEpoch,
  } = getLenderVaultInfo(offers, clusterStats)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Repayments" value={totalRepaymets} />
      <TooltipRow label="Closed offers" value={totalClosedOffersValue} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
    </div>
  )

  const formattedTotalFundsInCurrentEpoch = totalFundsInCurrentEpoch
    ? formatValueByTokenType(totalFundsInCurrentEpoch, tokenType)
    : 0

  const formattedTotalFundsInNextEpoch = totalFundsInNextEpoch
    ? formatValueByTokenType(totalFundsInNextEpoch, tokenType)
    : 0

  return (
    <div className={styles.container}>
      {isBanxSolTokenType(tokenType) && (
        <div className={styles.epochContainer}>
          <EpochProgressBar />
          <div className={styles.epochStats}>
            <StatInfo
              label="This epoch rewards"
              tooltipText="This epoch rewards"
              value={formattedTotalFundsInCurrentEpoch}
              icon={BanxSOL}
              flexType="row"
            />
            <StatInfo
              label="Next epoch rewards"
              tooltipText="This epoch rewards"
              value={formattedTotalFundsInNextEpoch}
              icon={BanxSOL}
              flexType="row"
            />
          </div>
        </div>
      )}

      <div className={styles.statsContainer}>
        <div className={styles.stats}>
          <StatInfo
            label="LST yield"
            tooltipText="LST yield"
            value={<DisplayValue value={totalLstYeild} />}
          />
          <StatInfo
            label="Liquidity"
            tooltipText={tooltipContent}
            value={<DisplayValue value={totalClaimableValue} />}
          />
        </div>

        <Button className={styles.claimButton} onClick={claimVault} disabled={!totalClaimableValue}>
          Claim
        </Button>
      </div>
    </div>
  )
}

export default Summary

interface TooltipRowProps {
  label: string
  value: number
}

const TooltipRow: FC<TooltipRowProps> = ({ label, value }) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue value={value} />
    </span>
  </div>
)
