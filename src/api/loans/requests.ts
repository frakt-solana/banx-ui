import axios from 'axios'

import { Loan } from './types'

type FetchWalletLoans = (props: { walletPublicKey: string }) => Promise<Loan[]>

export const fetchWalletLoans: FetchWalletLoans = async ({ walletPublicKey }) => {
  //TODO: Replace to BACKEND_BASE_URL
  const { data } = await axios.get<Loan[]>(`https://api.frakt.xyz/loan/all/${walletPublicKey}`)

  return data ?? []
}
