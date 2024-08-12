import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain, isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import Timer from '@banx/components/Timer'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useNftTokenType } from '@banx/store/nft'
import {
  caclulateBorrowTokenLoanValue,
  calculateLentTokenValueWithInterest,
  filterOutWalletLoans,
  findSuitableOffer,
  formatValueByTokenType,
  getTokenUnit,
  isTokenLoanActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useTokenLenderLoansTransactions } from '../hooks'
import { calculateFreezeExpiredAt, checkIfFreezeExpired } from './helpers'

import styles from './ManageModal.module.less'

export const ClosureContent: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const wallet = useWallet()

  const marketPubkey = loan.fraktBond.hadoMarket || ''
  const { offers, updateOrAddOffer, isLoading } = useTokenMarketOffers(marketPubkey)

  const { instantTokenLoan, terminateTokenLoan } = useTokenLenderLoansTransactions()

  const bestOffer = useMemo(() => {
    return chain(offers)
      .thru((offers) =>
        filterOutWalletLoans({
          offers: offers.map(convertBondOfferV3ToCore),
          walletPubkey: wallet?.publicKey?.toBase58(),
        }),
      )
      .thru((offers) =>
        findSuitableOffer({ loanValue: caclulateBorrowTokenLoanValue(loan).toNumber(), offers }),
      )
      .value()
  }, [loan, offers, wallet?.publicKey])

  const isLoanActive = isTokenLoanActive(loan)
  const hasRefinanceOffer = !isEmpty(bestOffer)

  const canRefinance = hasRefinanceOffer && isLoanActive
  const canTerminate = !isTokenLoanTerminating(loan) && isLoanActive

  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const isFreezeExpired = checkIfFreezeExpired(loan)

  const lentValue = calculateLentTokenValueWithInterest(loan).toNumber()

  const handleInstantLoan = async () => {
    await instantTokenLoan(loan, bestOffer, updateOrAddOffer)
  }

  return (
    <div className={styles.closureContent}>
      <ClouseContentInfo />

      {isFreezeExpired && (
        <div className={styles.modalContent}>
          {isLoading && <Loader />}
          {!isLoading && (
            <ActionsButton
              refinanceAction={handleInstantLoan}
              terminateAction={() => terminateTokenLoan(loan)}
              canTerminate={canTerminate}
              canRefinance={canRefinance}
              exitValue={lentValue}
            />
          )}
        </div>
      )}
      {!isFreezeExpired && <TimerContent expiredAt={freezeExpiredAt} />}
    </div>
  )
}

interface ActionsButtonProps {
  refinanceAction: () => Promise<void>
  terminateAction: () => Promise<void>
  canTerminate: boolean
  canRefinance: boolean
  exitValue: number
}

const ActionsButton: FC<ActionsButtonProps> = ({
  refinanceAction,
  terminateAction,
  canTerminate,
  canRefinance,
  exitValue,
}) => {
  const { tokenType } = useNftTokenType()
  const tokenUnit = getTokenUnit(tokenType)

  const formattedExitValue = formatValueByTokenType(exitValue, tokenType)

  const displayExitValueJSX = canRefinance ? (
    <div className={styles.exitValue}>
      Exit +{formattedExitValue} {tokenUnit}
    </div>
  ) : (
    <>No suitable offers yet</>
  )

  return (
    <div className={styles.twoColumnsContent}>
      <Button onClick={refinanceAction} disabled={!canRefinance} variant="secondary">
        {displayExitValueJSX}
      </Button>
      <Button
        className={styles.terminateButton}
        onClick={terminateAction}
        disabled={!canTerminate}
        variant="secondary"
      >
        Terminate
      </Button>
    </div>
  )
}

const ClouseContentInfo = () => (
  <div className={classNames(styles.modalContent, styles.twoColumnsContent, styles.closureTexts)}>
    <h3>Exit</h3>
    <h3>Terminate</h3>
    <p>Instantly receive your total claim</p>
    <p>
      Send your loan to refinancing auction to seek new lenders. If successful, you will receive SOL
      in your wallet. If unsuccessful after 72 hours you will receive the collateral instead
    </p>
  </div>
)

const TimerContent: FC<{ expiredAt: number }> = ({ expiredAt }) => (
  <div className={styles.freezeTimerWrapper}>
    Exit and termination are frozen for <Timer expiredAt={expiredAt} />
  </div>
)
