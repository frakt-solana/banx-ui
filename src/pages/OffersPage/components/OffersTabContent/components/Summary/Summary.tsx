import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { DisplayValue } from '@banx/components/TableComponents'

import { Offer, UserOffer } from '@banx/api/core'
import { usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimBondOfferInterestAction } from '@banx/transactions/bonds'
import {
  destroySnackbar,
  enqueueSnackbar,
  enqueueTranactionsError,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddOffer: (offer: Offer[]) => void
  offers: UserOffer[]
}

const Summary: FC<SummaryProps> = ({ updateOrAddOffer, offers }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()

  const totalAccruedInterest = useMemo(
    () => sumBy(offers, ({ offer }) => offer.concentrationIndex),
    [offers],
  )

  const claimInterest = () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    const txnParams = offers.map(({ offer }) => ({
      optimisticOffer: offer,
      priorityFeeLevel: priorityLevel,
    }))

    new TxnExecutor(makeClaimBondOfferInterestAction, {
      wallet: createWalletInstance(wallet),
      connection,
    })
      .addTransactionParams(txnParams)
      .on('sentAll', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results
        const failedTransactionsCount = failed.length

        destroySnackbar(loadingSnackbarId)

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Interest successfully claimed', type: 'success' })
          confirmed.forEach(({ result }) => result && updateOrAddOffer([result.bondOffer]))
        }

        if (failedTransactionsCount) {
          return enqueueTranactionsError(failedTransactionsCount)
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: offers,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'ClaimOfferInterest',
        })
      })
      .execute()
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainStat}>
        <p>
          <DisplayValue value={totalAccruedInterest} />
        </p>
        <p>Accrued interest</p>
      </div>
      <Button
        className={styles.claimButton}
        onClick={claimInterest}
        disabled={!totalAccruedInterest}
      >
        Claim
      </Button>
    </div>
  )
}

export default Summary
