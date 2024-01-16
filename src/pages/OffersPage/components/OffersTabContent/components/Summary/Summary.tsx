import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer, UserOffer } from '@banx/api/core'
import { TABLET_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimBondOfferInterestAction } from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

import { ClaimInterestButton } from './components'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddOffer: (offer: Offer[]) => void
  offers: UserOffer[]
}

const Summary: FC<SummaryProps> = ({ updateOrAddOffer, offers }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { width } = useWindowSize()
  const isSmallDesktop = width < TABLET_WIDTH

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
    <div className={styles.summaryContainer}>
      <ClaimInterestButton
        onClick={claimInterest}
        isSmallDesktop={isSmallDesktop}
        value={totalAccruedInterest}
      />
    </div>
  )
}

export default Summary
