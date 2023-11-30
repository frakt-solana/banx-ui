import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan, Offer } from '@banx/api/core'
import { SMALL_DESKTOP_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeClaimBondOfferInterestAction } from '@banx/transactions/bonds'
import { makeClaimAction, makeTerminateAction } from '@banx/transactions/loans'
import { calcLoanBorrowedAmount, enqueueSnackbar } from '@banx/utils'

import { ClaimInterestButton, ClaimNFTsButton, TerminateButton } from './components'

import styles from './Summary.module.less'

interface SummaryProps {
  updateOrAddLoan: (loan: Loan) => void
  updateOrAddOffer: (offer: Offer[]) => void
  addMints: (...mints: string[]) => void
  loansToClaim: Loan[]
  loansToTerminate: Loan[]
  offers: Offer[]
}

const Summary: FC<SummaryProps> = ({
  updateOrAddLoan,
  updateOrAddOffer,
  loansToTerminate,
  loansToClaim,
  addMints,
  offers,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { width } = useWindowSize()
  const isSmallDesktop = width < SMALL_DESKTOP_WIDTH

  const totalClaimableFloor = useMemo(
    () => sumBy(loansToClaim, ({ nft }) => nft.collectionFloor),
    [loansToClaim],
  )

  const totalTerminateLent = useMemo(
    () => sumBy(loansToTerminate, (loan) => calcLoanBorrowedAmount(loan)),
    [loansToTerminate],
  )

  const totalAccruedInterest = useMemo(
    () => sumBy(offers, (offer) => offer.concentrationIndex),
    [offers],
  )

  const terminateLoans = () => {
    const txnParams = loansToTerminate.map((loan) => ({ loan }))

    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ txnHash, result }) => {
          enqueueSnackbar({
            message: 'Collateral successfully terminated',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })

          if (result) {
            updateOrAddLoan(result)
          }
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const claimInterest = () => {
    if (!offers.length) return

    const txnParams = offers.map((optimisticOffer) => ({ optimisticOffer }))

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

  const claimLoans = () => {
    const txnParams = loansToClaim.map((loan) => ({ loan }))

    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParams(txnParams)
      .on('pfSuccessEach', (results) => {
        enqueueSnackbar({
          message: 'Collateral successfully claimed',
          type: 'success',
          solanaExplorerPath: `tx/${results[0].txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        addMints(...loansToClaim.map(({ nft }) => nft.mint))
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim',
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

      <ClaimNFTsButton
        onClick={claimLoans}
        totalLoans={loansToClaim.length}
        value={totalClaimableFloor}
        isSmallDesktop={isSmallDesktop}
      />

      <TerminateButton
        onClick={terminateLoans}
        totalLoans={loansToTerminate.length}
        value={totalTerminateLent}
        isSmallDesktop={isSmallDesktop}
      />
    </div>
  )
}

export default Summary
