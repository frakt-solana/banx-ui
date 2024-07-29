import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'
import {
  DisplayValue,
  createPercentValueJSX,
  createPlaceholderJSX,
} from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { USDC } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { useTokenLoansOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { parseBorrowRefinanceSimulatedAccounts } from '@banx/transactions/nftLending'
import {
  CreateBorrowTokenRefinanceTxnDataParams,
  createBorrowTokenRefinanceTxnData,
} from '@banx/transactions/tokenLending'
import {
  caclulateBorrowTokenLoanValue,
  calculateTokenLoanValueWithUpfrontFee,
  convertToHumanNumber,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  getDecimalPlaces,
  getTokenUnit,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useSelectedTokenLoans } from '../../loansState'
import { calculateNewLoanInfo, calculateTokenBorrowApr } from './helpers'
import { useRefinanceTokenOffer } from './hooks'

import styles from './ActionsCell.module.less'

interface RefinanceTokenModalProps {
  loan: core.TokenLoan
}

export const RefinanceTokenModal: FC<RefinanceTokenModalProps> = ({ loan }) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { tokenType } = useNftTokenType()
  const { close } = useModal()

  const { offer, updateOrAddOffer, isLoading } = useRefinanceTokenOffer(loan)
  const { update: updateLoansOptimistic } = useTokenLoansOptimistic()
  const { clear: clearSelection } = useSelectedTokenLoans()

  const isLoanTerminating = isTokenLoanTerminating(loan)

  const currentLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const currentLoanBorrowedAmount = calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
  const currentApr = loan.bondTradeTransaction.amountOfBonds

  const { newLoanDebt, newLoanBorrowed, newLoanApr, upfrontFee } = calculateNewLoanInfo({
    loan,
    offer,
    currentLoanDebt,
  })

  const differenceToPay = newLoanDebt - currentLoanDebt - upfrontFee

  const refinance = async () => {
    if (!offer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createBorrowTokenRefinanceTxnData(
        {
          loan,
          offerPublicKey: offer.offerPublicKey,
          solToRefinance: new BN(offer.amountToGet, 'hex').toNumber(),
          aprRate: calculateTokenBorrowApr(loan, offer),
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateBorrowTokenRefinanceTxnDataParams>(
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
                ...params.loan,
                publicKey: fraktBond.publicKey,
                fraktBond: { ...fraktBond, hadoMarket: params.loan.fraktBond.hadoMarket },
                bondTradeTransaction,
              }

              updateOrAddOffer([bondOffer])
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
        transactionName: 'RefinanceTokenBorrow',
      })
    }
  }

  const actionButtonText = isLoanTerminating ? 'Extend' : 'Reborrow'

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
            tokenType={tokenType}
            faded
          />
          <LoanInfo
            title="New loan"
            borrowedAmount={newLoanBorrowed}
            debt={newLoanDebt}
            apr={newLoanApr}
            className={styles.newLoanInfo}
            tokenType={tokenType}
          />

          <LoanDifference
            offer={offer}
            difference={differenceToPay}
            tokenType={tokenType}
            className={styles.difference}
          />

          <Button onClick={refinance} className={styles.refinanceModalButton} disabled={!offer}>
            {!offer ? 'No suitable offers yet' : actionButtonText}
          </Button>
        </>
      )}
    </Modal>
  )
}

interface LoanInfoProps {
  title: string
  borrowedAmount: number //? lamports
  debt: number //? lamports
  apr: number //? base points
  faded?: boolean //? Make gray text color
  className?: string
  tokenType: LendingTokenType
}

const TOKEN_PLACEHOLDER = {
  [LendingTokenType.NativeSol]: createPlaceholderJSX('--', '◎'),
  [LendingTokenType.BanxSol]: createPlaceholderJSX('--', '◎'),
  //? Using viewBox to visually scale up icon without changing its size
  [LendingTokenType.Usdc]: createPlaceholderJSX('--', <USDC viewBox="0 1 15 15" />),
}

const LoanInfo: FC<LoanInfoProps> = ({
  title,
  borrowedAmount,
  debt,
  apr,
  faded,
  className,
  tokenType,
}) => {
  const placeholder = TOKEN_PLACEHOLDER[tokenType]

  const aprPercentWithProtocolFee = (apr + BONDS.PROTOCOL_REPAY_FEE) / 100
  const displayAprValue = apr ? createPercentValueJSX(aprPercentWithProtocolFee) : '--'

  return (
    <div className={classNames(styles.loanInfo, faded && styles.loanInfoFaded, className)}>
      <h5 className={styles.loanInfoTitle}>{title}</h5>
      <div className={styles.loanInfoStats}>
        <div className={styles.loanInfoValue}>
          <p>
            <DisplayValue value={borrowedAmount} placeholder={placeholder} />
          </p>
          <p>Borrowed</p>
        </div>

        <div className={styles.loanInfoValue}>
          <p>{displayAprValue}</p>
          <p>APR</p>
        </div>

        <div className={styles.loanInfoValue}>
          <p>
            <DisplayValue value={debt} placeholder={placeholder} />
          </p>
          <p>Debt</p>
        </div>
      </div>
    </div>
  )
}

interface LoanDifferenceProps {
  offer: core.BorrowSplTokenOffers | undefined
  difference: number //? Integer representation of value
  tokenType: LendingTokenType
  className?: string
}

const LoanDifference: FC<LoanDifferenceProps> = ({ offer, difference, className, tokenType }) => {
  const isDifferenceNegative = difference < 0

  const subtitle = isDifferenceNegative ? 'Difference you will pay' : 'Difference you will receive'

  const convertedValue = convertToHumanNumber(difference, tokenType)
  const tokenDecimalPlaces = getDecimalPlaces(convertedValue, tokenType)
  const tokenUnit = getTokenUnit(tokenType)
  const placeholder = TOKEN_PLACEHOLDER[tokenType]

  const displayValue = offer ? (
    <>
      {convertedValue?.toFixed(tokenDecimalPlaces)}
      {tokenUnit}
    </>
  ) : (
    placeholder
  )

  return (
    <div className={classNames(styles.loanDifference, className)}>
      <p
        className={classNames(
          styles.loanDifferenceTitle,
          { [styles.loanDifferenceTitlePrimary]: !offer },
          { [styles.loanDifferenceTitleRed]: offer && isDifferenceNegative },
        )}
      >
        {displayValue}
      </p>
      <p className={styles.loanDifferenceSubtitle}>{subtitle}</p>
    </div>
  )
}
