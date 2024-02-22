import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Offer, UserOffer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimBondOfferInterestAction } from '@banx/transactions/bonds'
import { enqueueSnackbar, formatDecimal } from '@banx/utils'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddOffer: (offer: Offer[]) => void
  offers: UserOffer[]
}

const Summary: FC<SummaryProps> = ({ updateOrAddOffer, offers }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const totalAccruedInterest = useMemo(
    () => sumBy(offers, ({ offer }) => offer.concentrationIndex),
    [offers],
  )

  const claimInterest = () => {
    if (!offers.length) return

    const txnParams = offers.map(({ offer }) => ({ optimisticOffer: offer }))

    new TxnExecutor(makeClaimBondOfferInterestAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ result }) => {
          if (result) updateOrAddOffer([result.bondOffer])
        })
      })
      .on('pfSuccessAll', () => {
        enqueueSnackbar({
          message: 'Interest successfully claimed',
          type: 'success',
        })
      })
      .on('pfError', (error) => {
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
        <p>{createSolValueJSX(totalAccruedInterest, 1e9, '0◎', formatDecimal)}</p>
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
