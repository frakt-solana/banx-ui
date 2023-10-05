import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { filter, find, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeClaimAction } from '@banx/transactions/loans'
import { enqueueSnackbar, isLoanActive, isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import { useLenderLoansAndOffers } from './hooks'

import styles from './ActiveOffersTable.module.less'

interface SummaryProps {
  loans: Loan[]
}

export const Summary: FC<SummaryProps> = ({ loans }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { addMints } = useLenderLoansAndOffers()

  const loansToClaim = useMemo(() => {
    return loans.length ? filter(loans, isLoanAbleToClaim) : []
  }, [loans])

  const totalClaimableFloor = useMemo(() => {
    return sumBy(loansToClaim, ({ nft }) => nft.collectionFloor)
  }, [loansToClaim])

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
    <div className={styles.summary}>
      <div className={styles.totalLoans}>
        <p className={styles.totalLoansValue}>{loansToClaim.length}</p>
        <div className={styles.totalLoansInfo}>
          <p>Collaterals</p>
          <p>to claim</p>
        </div>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total claimable floor" value={totalClaimableFloor} divider={1e9} />
      </div>
      <div className={styles.summaryBtns}>
        <Button onClick={claimLoans} disabled={!loansToClaim.length}>
          Claim all NFTs
        </Button>
      </div>
    </div>
  )
}

type ShowSummary = (loans: Loan[]) => boolean
export const showSummary: ShowSummary = (loans = []) => {
  return !!find(loans, isLoanAbleToClaim)
}

type IsLoanAbleToClaim = (loan: Loan) => boolean
export const isLoanAbleToClaim: IsLoanAbleToClaim = (loan) => {
  const loanActive = isLoanActive(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanActiveOrTerminating = loanActive || isTerminatingStatus
  const isLoanExpired = isLoanLiquidated(loan)

  return !isLoanActiveOrTerminating || isLoanExpired
}
