import { clear, get, set } from 'idb-keyval'
import moment from 'moment'

const BANX_LAST_IDB_PURGE_TIMESTAMP = '@banx.lastIdbPurgeTimestamp'

export const purgeIdb = async () => {
  try {
    const purgeDate = await get<number>(BANX_LAST_IDB_PURGE_TIMESTAMP)

    if (!purgeDate) {
      clear()
      await set(BANX_LAST_IDB_PURGE_TIMESTAMP, moment().unix())
    }
  } catch (error) {
    console.error('Error trying to purge idb')
  }
}
