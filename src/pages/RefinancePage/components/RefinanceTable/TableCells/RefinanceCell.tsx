import React, { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRefinanceAction } from '@banx/transactions/loans'

interface RefinanceCellProps {
  loan: Loan
  isCardView?: boolean
}

export const RefinanceCell: FC<RefinanceCellProps> = ({ loan, isCardView = false }) => {
  const refinance = useRefinanceTransaction(loan)

  return (
    <Button onClick={refinance} size={isCardView ? 'large' : 'small'}>
      Refinance
    </Button>
  )
}

const useRefinanceTransaction = (loan: Loan) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const refinance = () => {
    new TxnExecutor(makeRefinanceAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return refinance
}
