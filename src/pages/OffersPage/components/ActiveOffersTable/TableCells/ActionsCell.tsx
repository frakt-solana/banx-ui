import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, first, isEmpty, sortBy } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan, Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'

import { useLenderLoansAndOffers } from '../../ActiveOffersTab/hooks'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

const isPerpetualActive = BondTradeTransactionV2State.PerpetualActive
const isPerpetualTerminating = BondTradeTransactionV2State.PerpetualManualTerminating

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView }) => {
  const { bondTradeTransaction, fraktBond } = loan
  const { bondTradeTransactionState } = bondTradeTransaction
  const { publicKey } = useWallet()

  const { offers } = useLenderLoansAndOffers()

  const bestOffer = useMemo(() => {
    const offersByMarket = offers[fraktBond.hadoMarket]

    const filteredOffers = filter(
      offersByMarket,
      (offer) =>
        offer.assetReceiver !== publicKey?.toBase58() &&
        offer.fundsSolOrTokenBalance > fraktBond.currentPerpetualBorrowed,
    )

    const sortedOffers = sortBy(filteredOffers, 'fundsSolOrTokenBalance')

    return first(sortedOffers) as Offer
  }, [offers, fraktBond, publicKey])

  const { terminateLoan, claimLoan, instantLoan } = useLendLoansTransactions({ loan, bestOffer })

  const isActiveLoan = bondTradeTransactionState === isPerpetualActive
  const isTerminatingLoan = bondTradeTransactionState === isPerpetualTerminating
  const availableToRefinance = isActiveLoan && !isEmpty(bestOffer)

  const buttonSize = isCardView ? 'large' : 'small'

  return (
    <div className={styles.actionsButtons}>
      {isActiveLoan || isTerminatingLoan ? (
        <>
          <Button
            onClick={terminateLoan}
            className={styles.terminateButton}
            disabled={isTerminatingLoan}
            variant="secondary"
            size={buttonSize}
          >
            Terminate
          </Button>
          <Button
            onClick={instantLoan}
            className={styles.instantButton}
            disabled={!availableToRefinance}
            variant="secondary"
            size={buttonSize}
          >
            Instant
          </Button>
        </>
      ) : (
        <Button onClick={claimLoan} className={styles.instantButton} size={buttonSize}>
          Claim NFT
        </Button>
      )}
    </div>
  )
}

export default ActionsCell

export const useLendLoansTransactions = ({ loan, bestOffer }: { loan: Loan; bestOffer: Offer }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const terminateLoan = () => {
    new TxnExecutor(makeTerminateAction, { wallet, connection }).addTxnParam({ loan }).execute()
  }

  const claimLoan = () => {
    new TxnExecutor(makeClaimAction, { wallet, connection }).addTxnParam({ loan }).execute()
  }

  const instantLoan = () => {
    new TxnExecutor(makeInstantRefinanceAction, { wallet, connection })
      .addTxnParam({ loan, bestOffer })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { terminateLoan, claimLoan, instantLoan }
}
