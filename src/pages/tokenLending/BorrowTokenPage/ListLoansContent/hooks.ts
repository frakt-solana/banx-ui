import { useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { CollateralToken } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { useTokenType } from '@banx/store/common'
import { useTokenLoansOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateTokenListTxnDataParams,
  createTokenListTxnData,
  parseListTokenSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  getTokenDecimals,
} from '@banx/utils'

import { DEFAULT_COLLATERAL_MINT } from '../InstantBorrowContent/hooks/constants'
import {
  useBorrowTokensList,
  useCollateralsList,
} from '../InstantBorrowContent/hooks/useCollateralsList'
import { BorrowToken } from '../constants'
import { getInputErrorMessage, getSummaryInfo } from './helpers'

export const MIN_APR_VALUE = 10
export const MAX_APR_VALUE = 140

export const useListLoansContent = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { tokenType, setTokenType } = useTokenType()

  const [collateralInputValue, setCollateralInputValue] = useState('')
  const [collateralToken, setCollateralToken] = useState<CollateralToken>()

  const [borrowInputValue, setBorrowlInputValue] = useState('')
  const [borrowToken, setBorrowToken] = useState<BorrowToken>()

  const [inputAprValue, setInputAprValue] = useState('')
  const [inputFreezeValue, setInputFreezeValue] = useState('')

  const { collateralsList } = useCollateralsList()
  const { borrowTokensList } = useBorrowTokensList()

  const collateralToSet = useMemo(() => {
    const [firstCollateral] = collateralsList

    return firstCollateral?.amountInWallet
      ? firstCollateral
      : collateralsList.find(({ collateral }) => collateral.mint === DEFAULT_COLLATERAL_MINT)
  }, [collateralsList])

  useEffect(() => {
    if (!collateralToken && collateralToSet) {
      setCollateralToken(collateralToSet)
    }
  }, [collateralToken, collateralToSet])

  useEffect(() => {
    const selectedBorrowToken = borrowTokensList.find(
      (token) => token.lendingTokenType === tokenType,
    )

    if (!selectedBorrowToken) return

    // Update collateral token only if it's the same token
    if (collateralToken?.collateral.mint === selectedBorrowToken.collateral.mint) {
      setCollateralToken(collateralToSet)
    }

    setBorrowToken(selectedBorrowToken)
  }, [borrowTokensList, tokenType, collateralToken, collateralToSet])

  const handleChangeFreezeValue = (value: string) => {
    return setInputFreezeValue(value)
  }

  const handleChangeAprValue = (value: string) => {
    return setInputAprValue(value)
  }

  const aprInputValueIsLow = parseFloat(inputAprValue) < MIN_APR_VALUE

  const lenderAprValue = !aprInputValueIsLow ? Math.round(parseFloat(inputAprValue) / 100) : 0

  const { ltvPercent, upfrontFee, weeklyFee } = getSummaryInfo({
    collateralAmount: parseFloat(collateralInputValue),
    borrowAmount: parseFloat(borrowInputValue),
    apr: parseFloat(inputAprValue),
    collateralToken,
    tokenType,
  })

  const errorMessage = getInputErrorMessage({
    collateralAmount: parseFloat(collateralInputValue),
    borrowAmount: parseFloat(borrowInputValue),
    freezeValue: parseFloat(inputFreezeValue),
    apr: parseFloat(inputAprValue),
  })

  const { add: addLoansOptimistic } = useTokenLoansOptimistic()

  const listLoan = async () => {
    if (!collateralToken) return

    const loadingSnackbarId = uniqueId()

    try {
      const tokenDecimals = getTokenDecimals(tokenType)
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const aprRate = parseFloat(inputAprValue) * 100

      const txnData = await createTokenListTxnData(
        {
          collateral: collateralToken,
          borrowAmount: parseFloat(borrowInputValue) * tokenDecimals,
          collateralAmount: parseFloat(collateralInputValue) * tokenDecimals,
          aprRate,
          freezeValue: parseFloat(inputFreezeValue) * SECONDS_IN_DAY,
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateTokenListTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          return confirmed.forEach(({ accountInfoByPubkey, signature, params }) => {
            enqueueSnackbar({
              message: 'Loan successfully listed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const { fraktBond, bondTradeTransaction } =
                parseListTokenSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = {
                publicKey: fraktBond.publicKey,
                collateral: params.collateral.collateral,
                collateralPrice: params.collateral.collateralPrice,
                bondTradeTransaction,
                fraktBond: {
                  ...fraktBond,
                  hadoMarket: params.collateral.marketPubkey,
                  lastTransactedAt: moment().unix(), //? Needs to prevent BE data overlap in optimistics logic
                },
              }

              if (wallet.publicKey) {
                addLoansOptimistic([optimisticLoan], wallet.publicKey.toBase58())
              }
            }

            if (failed.length) {
              return failed.forEach(({ signature, reason }) =>
                enqueueConfirmationError(signature, reason),
              )
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
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ListTokenLoan',
      })
    }
  }

  return {
    collateralsList,
    borrowTokensList,

    listLoan,

    borrowToken,
    setBorrowToken,
    borrowInputValue,
    setBorrowlInputValue,

    collateralToken,
    setCollateralToken,
    collateralInputValue,
    setCollateralInputValue,

    inputAprValue,
    inputFreezeValue,

    handleChangeFreezeValue,
    handleChangeAprValue,

    lenderAprValue,

    errorMessage,

    ltvPercent,
    upfrontFee,
    weeklyFee,
  }
}
