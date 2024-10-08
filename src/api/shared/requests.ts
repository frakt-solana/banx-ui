import axios from 'axios'

import { BACKEND_BASE_URL } from '@banx/constants'

import { UserVaultSchema } from './schemas'
import { UserVault } from './types'
import { parseResponseSafe } from './validation'

type FetchUserVaults = (props: { walletPublicKey: string }) => Promise<UserVault[] | undefined>

export const fetchUserVaults: FetchUserVaults = async ({ walletPublicKey }) => {
  const { data } = await axios.get<{ data: unknown }>(
    `${BACKEND_BASE_URL}/vault/${walletPublicKey}`,
  )

  return await parseResponseSafe<UserVault[]>(data?.data, UserVaultSchema.array())
}
