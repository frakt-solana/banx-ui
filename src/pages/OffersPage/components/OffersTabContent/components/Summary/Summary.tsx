import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondOfferOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { useTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createClaimBondOfferInterestTxnData } from '@banx/transactions/nftLending'
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
  const totalAccruedInterest = useMemo(
    () => sumBy(offers, ({ offer }) => offer.concentrationIndex),
    [offers],
  )

  const { tokenType } = useTokenType()

  const claimInterest = async () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        offers.map(({ offer }) =>
          createClaimBondOfferInterestTxnData({
            offer,
            walletAndConnection,
            tokenType,
          }),
        ),
      )

      //TODO: Fix genric here
      await new TxnExecutor<BondOfferOptimistic>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Interest successfully claimed', type: 'success' })
            confirmed.forEach(({ result }) => result && updateOrAddOffer([result.bondOffer]))
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
        transactionName: 'ClaimOfferInterest',
      })
    }
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
