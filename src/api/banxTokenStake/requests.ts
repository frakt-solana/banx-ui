import axios from 'axios'
import { web3 } from 'fbonds-core'

import { BACKEND_BASE_URL } from '@banx/constants'
import {BanxStake, BanxStakeSchema} from "@banx/api/banxTokenStake/types";


type FetchTokenStakeInfo = (props: { publicKey?: web3.PublicKey }) => Promise<BanxStake>
export const fetchTokenStakeInfo: FetchTokenStakeInfo = async ({ publicKey }) => {
  const { data } = await axios.get<{ data: BanxStake }>(
    `${BACKEND_BASE_URL}/tokenStake/${publicKey?.toBase58() || ''}`,
  )

  try {
    await BanxStakeSchema.parseAsync(data.data)
  } catch (validationError) {
    console.error('Schema validation error:', validationError)
  }

  return (
    data.data ?? {
      adventures: [],
    }
  )
}
