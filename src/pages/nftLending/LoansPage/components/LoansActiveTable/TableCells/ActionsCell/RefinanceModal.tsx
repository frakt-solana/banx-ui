import { FC, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import { Slider } from '@banx/components/Slider'
import {
  DisplayValue,
  createDisplayValueJSX,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { useMarketOffers } from '@banx/pages/nftLending/LendPage'
import { useModal } from '@banx/store/common'
import { useLoansOptimistic, useNftTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateBorrowRefinanceTxnDataParams,
  createBorrowRefinanceTxnData,
  parseBorrowRefinanceSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  calculateApr,
  calculateBorrowedAmount,
  calculateLoanRepayValue,
  convertToHumanNumber,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  filterOutWalletLoans,
  findSuitableOffer,
  getDecimalPlaces,
  getTokenUnit,
  isLoanTerminating,
  isOfferNotEmpty,
} from '@banx/utils'

import { useSelectedLoans } from '../../loansState'

import styles from './ActionsCell.module.less'

interface RefinanceModalProps {
  loan: core.Loan
}

export const RefinanceModal: FC<RefinanceModalProps> = ({ loan }) => {
  const { bondTradeTransaction, fraktBond, nft } = loan

  const wallet = useWallet()
  const { connection } = useConnection()

  const { close } = useModal()
  const { tokenType } = useNftTokenType()

  const { offers, updateOrAddOffer, isLoading } = useMarketOffers({
    marketPubkey: fraktBond.hadoMarket,
  })

  const bestOffer = useMemo(() => {
    return chain(offers)
      .sortBy(({ currentSpotPrice }) => currentSpotPrice)
      .thru((offers) =>
        filterOutWalletLoans({
          offers,
          walletPubkey: wallet?.publicKey?.toBase58(),
        }),
      )
      .filter(isOfferNotEmpty)
      .reverse()
      .value()
      .at(0)
  }, [offers, wallet])

  const initialCurrentSpotPrice = useMemo(() => {
    if (!bestOffer) return 0
    return bestOffer.currentSpotPrice
  }, [bestOffer])

  useEffect(() => {
    setCurrentSpotPrice(initialCurrentSpotPrice)
  }, [initialCurrentSpotPrice])

  const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clear: clearSelection } = useSelectedLoans()

  const isTerminatingStatus = isLoanTerminating(loan)

  const [partialPercent, setPartialPercent] = useState<number>(100)
  const [currentSpotPrice, setCurrentSpotPrice] = useState<number>(initialCurrentSpotPrice)

  const onPartialPercentChange = (percentValue: number) => {
    setPartialPercent(percentValue)
    setCurrentSpotPrice(Math.max(Math.floor((initialCurrentSpotPrice * percentValue) / 100), 1000))
  }

  const currentLoanDebt = calculateLoanRepayValue(loan)
  const currentLoanBorrowedAmount = calculateBorrowedAmount(loan).toNumber()
  const currentApr = bondTradeTransaction.amountOfBonds

  //? Upfront fee on reborrow is calculated: (newDebt - prevDebt) / 100
  const upfrontFee = Math.max((currentSpotPrice - currentLoanDebt) / 100, 0)

  const newLoanBorrowedAmount = currentSpotPrice - upfrontFee
  const newLoanDebt = currentSpotPrice

  const newApr = calculateApr({
    loanValue: newLoanBorrowedAmount,
    collectionFloor: nft.collectionFloor,
    marketPubkey: fraktBond.hadoMarket,
  })

  const differenceToPay = newLoanDebt - currentLoanDebt - upfrontFee

  const refinance = async () => {
    if (!bestOffer) return

    const suitableOffer = chain(offers)
      .thru((offers) =>
        filterOutWalletLoans({
          offers,
          walletPubkey: wallet?.publicKey?.toBase58(),
        }),
      )
      .thru((offers) =>
        findSuitableOffer({
          loanValue: currentSpotPrice,
          offers,
        }),
      )
      .value()

    if (!suitableOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createBorrowRefinanceTxnData(
        {
          loan,
          offer: suitableOffer,
          solToRefinance: currentSpotPrice,
          aprRate: newApr,
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateBorrowRefinanceTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ params, accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey && wallet?.publicKey) {
              enqueueSnackbar({
                message: 'Loan successfully refinanced',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { bondOffer, bondTradeTransaction, fraktBond } =
                parseBorrowRefinanceSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = {
                publicKey: fraktBond.publicKey,
                fraktBond: fraktBond,
                bondTradeTransaction,
                nft: params.loan.nft,
              }

              updateOrAddOffer(bondOffer)
              updateLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              clearSelection()
              close()
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RefinanceBorrow',
      })
    }
  }

  return (
    <Modal open onCancel={close}>
      {isLoading && <Loader />}
      {!isLoading && (
        <>
          <LoanInfo
            title="Current loan"
            borrowedAmount={currentLoanBorrowedAmount}
            debt={currentLoanDebt}
            apr={currentApr}
            className={styles.currentLoanInfo}
            faded
          />
          <LoanInfo
            title="New loan"
            borrowedAmount={newLoanBorrowedAmount}
            debt={newLoanDebt}
            apr={newApr}
            className={styles.newLoanInfo}
          />

          <LoanDifference
            difference={differenceToPay}
            tokenType={tokenType}
            className={styles.difference}
          />

          <Slider
            label="Loan"
            value={partialPercent}
            onChange={onPartialPercentChange}
            className={styles.refinanceModalSlider}
            marks={DEFAULT_SLIDER_MARKS}
            min={10}
            max={100}
          />

          <Button className={styles.refinanceModalButton} onClick={refinance} disabled={!bestOffer}>
            {isTerminatingStatus ? 'Extend' : 'Rollover'}
          </Button>
        </>
      )}
    </Modal>
  )
}

const DEFAULT_SLIDER_MARKS = {
  10: '10%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
}

interface LoanInfoProps {
  title: string
  borrowedAmount: number //? lamports
  debt: number //? lamports
  apr: number //? base points
  faded?: boolean //? Make gray text color
  className?: string
}

const LoanInfo: FC<LoanInfoProps> = ({ title, borrowedAmount, debt, apr, faded, className }) => {
  return (
    <div className={classNames(styles.loanInfo, faded && styles.loanInfoFaded, className)}>
      <h5 className={styles.loanInfoTitle}>{title}</h5>
      <div className={styles.loanInfoStats}>
        <div className={styles.loanInfoValue}>
          <p>
            <DisplayValue value={borrowedAmount} />
          </p>
          <p>Borrowed</p>
        </div>
        <div className={styles.loanInfoValue}>
          <p>{createPercentValueJSX((apr + BONDS.REPAY_FEE_APR) / 100)}</p>
          <p>APR</p>
        </div>
        <div className={styles.loanInfoValue}>
          <p>
            <DisplayValue value={debt} />
          </p>
          <p>Debt</p>
        </div>
      </div>
    </div>
  )
}

interface LoanDifferenceProps {
  difference: number //? Integer representation of value
  tokenType: LendingTokenType
  className?: string
}

const LoanDifference: FC<LoanDifferenceProps> = ({ className, difference, tokenType }) => {
  const isNegativeDifference = difference < 0

  const subtitle = isNegativeDifference ? 'Difference you will pay' : 'Difference you will receive'

  const convertedValue = convertToHumanNumber(difference, tokenType)
  const tokenDecimalPlaces = getDecimalPlaces(convertedValue, tokenType)
  const tokenUnit = getTokenUnit(tokenType)

  const sign = isNegativeDifference ? '-' : '+'
  const displayValue = Math.abs(convertedValue).toFixed(tokenDecimalPlaces)

  return (
    <div className={classNames(styles.loanDifference, className)}>
      <p
        className={classNames(
          styles.loanDifferenceTitle,
          isNegativeDifference && styles.loanDifferenceTitleRed,
        )}
      >
        {sign}
        {createDisplayValueJSX(displayValue, tokenUnit)}
      </p>
      <p className={styles.loanDifferenceSubtitle}>{subtitle}</p>
    </div>
  )
}
