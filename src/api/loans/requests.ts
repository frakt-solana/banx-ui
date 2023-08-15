import axios from 'axios'

import { BACKEND_BASE_URL, IS_PRIVATE_MARKETS } from '@banx/constants'

import { Loan, WalletLoansResponse } from './types'

type FetchWalletLoans = (props: {
  walletPublicKey: string
  order?: string
  skip?: number
  limit?: number
  getAll?: boolean
}) => Promise<Loan[]>

export const fetchWalletLoans: FetchWalletLoans = async ({
  walletPublicKey,
  order = 'asc',
  skip = 0,
  limit = 10,
  getAll = false,
}) => {
  try {
    const queryParams = new URLSearchParams({
      order,
      skip: String(skip),
      limit: String(limit),
      getAll: String(getAll),
      isPrivate: String(IS_PRIVATE_MARKETS),
    })

    const { data } = await axios.get<WalletLoansResponse>(
      `${BACKEND_BASE_URL}/loans/${walletPublicKey}?${queryParams.toString()}`,
    )

    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
}
