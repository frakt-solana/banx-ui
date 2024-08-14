import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { EpochProgressBar } from '@banx/components/EpochProgressBar'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { useClusterStats } from '@banx/hooks'
import { BanxSOL } from '@banx/icons'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent'
import { useTokenOffersPreview } from '@banx/pages/tokenLending/OffersTokenPage/components/OffersTokenTabContent'
import { useIsLedger } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
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
  formatValueByTokenType,
  isBanxSolTokenType,
} from '@banx/utils'

import { TooltipRow } from '../components'
import { getLenderVaultInfo, getLenderVaultInfoBN } from './helpers'

import styles from '../WalletModal.module.less'

export const TokenLenderVault = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useNftTokenType()

  const { data: clusterStats } = useClusterStats()
  const { isLedger } = useIsLedger()

  const { offersPreview: tokenOffersPreview, updateOrAddOffer } = useTokenOffersPreview()

  const offers = useMemo(() => {
    return tokenOffersPreview.map((offer) => offer.bondOffer)
  }, [tokenOffersPreview])

  const lenderVaultInfo = getLenderVaultInfoBN(offers, clusterStats)

  const claimVault = async () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        offers.map((offer) =>
          createClaimLenderVaultTxnData(
            {
              offer: convertBondOfferV3ToCore(offer),
              tokenType,
              clusterStats,
            },
            walletAndConnection,
          ),
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
              updateOrAddOffer([offer])
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

  const formattedTotalFundsInCurrentEpoch = totalFundsInCurrentEpoch
    ? formatValueByTokenType(totalFundsInCurrentEpoch, tokenType)
    : 0

  const formattedTotalFundsInNextEpoch = totalFundsInNextEpoch
    ? formatValueByTokenType(totalFundsInNextEpoch, tokenType)
    : 0

  const formattedLstYieldValue = totalLstYield
    ? formatValueByTokenType(totalLstYield, tokenType)
    : 0

  return (
    <div className={styles.lenderVaultContainer}>
      {isBanxSolTokenType(tokenType) && (
        <div className={styles.epochContainer}>
          <EpochProgressBar />
          <div className={styles.epochStats}>
            <StatInfo
              label="Yield for this epoch"
              tooltipText="Liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx for the entire epoch (excluding taken loans)"
              value={formattedTotalFundsInCurrentEpoch}
              icon={BanxSOL}
              flexType="row"
            />
            <StatInfo
              label="Yield for next epoch"
              tooltipText="Projected liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx throughout the next epoch (excluding taken loans)"
              value={formattedTotalFundsInNextEpoch}
              icon={BanxSOL}
              flexType="row"
            />
          </div>
        </div>
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
            <StatInfo
              label="LST yield"
              tooltipText="Yield generated from the BanxSOL integrated Liquid Staking Token, based on the $SOL you hold in Banx throughout a whole epoch, excluding $SOL in taken loans"
              value={formattedLstYieldValue}
              classNamesProps={{ value: styles.claimableValue }}
              icon={BanxSOL}
            />
          )}
        </div>
        <Button onClick={claimVault} disabled={!totalClaimableValue} size="small">
          Claim
        </Button>
      </div>
    </div>
  )
}

export const NftLenderVault = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useNftTokenType()

  const { isLedger } = useIsLedger()

  const { data: clusterStats } = useClusterStats()
  const { offers: nftsOffers, updateOrAddOffer } = useUserOffers()

  const offers = useMemo(() => {
    return nftsOffers.map((offer) => offer.offer)
  }, [nftsOffers])

  const lenderVaultInfo = getLenderVaultInfo(offers, clusterStats)

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
          createClaimLenderVaultTxnData(
            {
              offer: offer,
              tokenType,
              clusterStats,
            },
            walletAndConnection,
          ),
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
              updateOrAddOffer([offer])
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

  const formattedTotalFundsInCurrentEpoch = totalFundsInCurrentEpoch
    ? formatValueByTokenType(totalFundsInCurrentEpoch, tokenType)
    : 0

  const formattedTotalFundsInNextEpoch = totalFundsInNextEpoch
    ? formatValueByTokenType(totalFundsInNextEpoch, tokenType)
    : 0

  const formattedLstYieldValue = totalLstYield
    ? formatValueByTokenType(totalLstYield, tokenType)
    : 0

  return (
    <div className={styles.lenderVaultContainer}>
      {isBanxSolTokenType(tokenType) && (
        <div className={styles.epochContainer}>
          <EpochProgressBar />
          <div className={styles.epochStats}>
            <StatInfo
              label="Yield for this epoch"
              tooltipText="Liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx for the entire epoch (excluding taken loans)"
              value={formattedTotalFundsInCurrentEpoch}
              icon={BanxSOL}
              flexType="row"
            />
            <StatInfo
              label="Yield for next epoch"
              tooltipText="Projected liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx throughout the next epoch (excluding taken loans)"
              value={formattedTotalFundsInNextEpoch}
              icon={BanxSOL}
              flexType="row"
            />
          </div>
        </div>
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
            <StatInfo
              label="LST yield"
              tooltipText="Yield generated from the BanxSOL integrated Liquid Staking Token, based on the $SOL you hold in Banx throughout a whole epoch, excluding $SOL in taken loans"
              value={formattedLstYieldValue}
              classNamesProps={{ value: styles.claimableValue }}
              icon={BanxSOL}
            />
          )}
        </div>
        <Button onClick={claimVault} disabled={!totalClaimableValue} size="small">
          Claim
        </Button>
      </div>
    </div>
  )
}
