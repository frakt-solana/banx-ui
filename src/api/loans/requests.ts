import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_DOMAIN } from '@banx/constants'

import { Loan } from './types'

type FetchWalletLoans = (props: { publicKey: web3.PublicKey }) => Promise<Loan[]>

export const fetchWalletLoans: FetchWalletLoans = async ({ publicKey }) => {
  const { data } = await axios.get<Loan[]>(
    `https://${BACKEND_DOMAIN}/loan/all/${publicKey?.toBase58()}`,
  )

  return data ?? []
}
