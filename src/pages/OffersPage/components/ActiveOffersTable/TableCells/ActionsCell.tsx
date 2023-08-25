import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, first, isEmpty, maxBy, sortBy } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan, Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  InstantRefinanceOptimisticResult,
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'

import { useHiddenNftsAndOffers, useLenderLoansAndOffers } from '../../ActiveOffersTab/hooks'

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

  const {
    offers: optimisticOffers,
    findOffer,
    updateOffer,
    addOffer,
    addMints,
  } = useHiddenNftsAndOffers()
  const { offers } = useLenderLoansAndOffers()

  const updateOrAddOffer = (offer: Offer) => {
    const offerExists = !!findOffer(offer.publicKey)

    return offerExists ? updateOffer(offer) : addOffer(offer)
  }

  const bestOffer = useMemo(() => {
    const offersByMarket = offers[fraktBond.hadoMarket]

    const combinedOffers = [...optimisticOffers, ...(offersByMarket ?? [])]

    const filteredOffers = chain(combinedOffers)
      .groupBy('publicKey')
      .map((offers) => maxBy(offers, 'lastTransactedAt'))
      .compact()
      .filter((offer) => calculateLoanValue(offer) > fraktBond.currentPerpetualBorrowed)
      .value()

    const sortedOffers = sortBy(filteredOffers, 'fundsSolOrTokenBalance')

    return first(sortedOffers) as Offer
  }, [offers, fraktBond, optimisticOffers])

  const { terminateLoan, claimLoan, instantLoan } = useLendLoansTransactions({
    loan,
    bestOffer,
    updateOrAddOffer,
    addMints,
  })

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

const calculateLoanValue = (offer: Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer
  const fullOffersAmount = Math.floor(fundsSolOrTokenBalance / currentSpotPrice)
  const loanValue = currentSpotPrice * Math.min(fullOffersAmount, 1)
  return loanValue
}

export const useLendLoansTransactions = ({
  loan,
  bestOffer,
  updateOrAddOffer,
  addMints,
}: {
  loan: Loan
  bestOffer: Offer
  updateOrAddOffer: (offers: Offer) => void
  addMints: (...mints: string[]) => void
}) => {
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
      .on('pfSuccessEvery', (additionalResult: InstantRefinanceOptimisticResult[]) => {
        updateOrAddOffer(additionalResult[0].bondOffer)
        addMints(loan.nft.mint)
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { terminateLoan, claimLoan, instantLoan }
}
