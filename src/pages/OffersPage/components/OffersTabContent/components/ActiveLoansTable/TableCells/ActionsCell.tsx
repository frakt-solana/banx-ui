import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { useMarketOffers } from '@banx/pages/LendPage/hooks'
import { useHiddenNftsMints } from '@banx/pages/OffersPage/hooks'
import {
  isLoanActiveOrRefinanced,
  isLoanLiquidated,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import { findBestOffer } from '../helpers'
import { useLendLoansTransactions } from '../hooks'

import styles from '../ActiveLoansTable.module.less'

interface ActionsCellProps {
  loan: Loan
  updateOrAddLoan: (loan: Loan) => void
  isCardView?: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({
  loan,
  updateOrAddLoan,
  isCardView = false,
}) => {
  const { publicKey } = useWallet()
  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey: loan.fraktBond.hadoMarket })
  const { addMints } = useHiddenNftsMints()

  const bestOffer = useMemo(() => {
    return findBestOffer({ loan, offers, walletPubkey: publicKey?.toBase58() || '' })
  }, [offers, loan, publicKey])

  const { terminateLoan, claimLoan, instantLoan } = useLendLoansTransactions({
    loan,
    bestOffer,
    updateOrAddLoan,
    updateOrAddOffer,
    addMints,
  })

  const onTerminate = () => {
    trackPageEvent('myoffers', 'activetab-terminate')
    terminateLoan()
  }

  const onInstant = () => {
    trackPageEvent('myoffers', 'activetab-instantrefinance')
    instantLoan()
  }

  const onClaim = () => {
    trackPageEvent('myoffers', 'activetab-claim')
    claimLoan()
  }

  const loanActiveOrRefinanced = isLoanActiveOrRefinanced(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  const hasRefinanceOffers = !isEmpty(bestOffer)
  const canRefinance = hasRefinanceOffers && loanActiveOrRefinanced

  const showClaimButton = isLoanExpired && isTerminatingStatus
  const showTerminateButton = (!canRefinance || isTerminatingStatus) && !showClaimButton
  const showInstantButton = canRefinance && !showClaimButton

  const buttonSize = isCardView ? 'medium' : 'small'

  return (
    <div className={styles.actionsButtons}>
      {showTerminateButton && (
        <Button
          className={styles.actionButton}
          onClick={onTerminate}
          disabled={isTerminatingStatus}
          variant="secondary"
          size={buttonSize}
        >
          Terminate
        </Button>
      )}

      {showInstantButton && (
        <Button
          className={styles.actionButton}
          onClick={onInstant}
          variant="secondary"
          size={buttonSize}
        >
          Instant
        </Button>
      )}
      {showClaimButton && (
        <Button className={styles.actionButton} onClick={onClaim} size={buttonSize}>
          Claim NFT
        </Button>
      )}
    </div>
  )
}

export default ActionsCell
