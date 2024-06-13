import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { Offer, core } from '@banx/api/nft'
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

  const totalAccruedInterest = sumBy(offers, ({ offer }) => offer.concentrationIndex)
  const totalRepaymets = sumBy(offers, ({ offer }) => offer.bidCap)
  // const totalLstYeild = sumBy(offers, ({ offer }) => offer.bidCap)

  const totalClaimableValue = totalAccruedInterest + totalRepaymets

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <StatInfo label="Repayments" value={<DisplayValue value={totalRepaymets} />} />
        <StatInfo label="Accrued interest" value={<DisplayValue value={totalAccruedInterest} />} />
        {/* <StatInfo label="LST yield" value={<DisplayValue value={totalLstYeild} />} /> */}
      </div>

      <Button className={styles.claimButton} onClick={claimVault} disabled={!totalClaimableValue}>
        Claim
      </Button>
    </div>
  )
}

export default Summary
