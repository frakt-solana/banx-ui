import sdkPackage from 'fbonds-core/package.json'
import { clear, get, set } from 'idb-keyval'

const SDK_VERSION = sdkPackage.version
const BANX_SDK_VERSION_KEY = '@banx.sdkVersion'

export const purgeIdb = async () => {
  // eslint-disable-next-line no-console
  console.log(SDK_VERSION, 'SDK_VERSION')
  try {
    const storedSdkVersion = await get<string>(BANX_SDK_VERSION_KEY)

    if (storedSdkVersion !== SDK_VERSION) {
      await clear()
      await set(BANX_SDK_VERSION_KEY, SDK_VERSION)
    }
  } catch (error) {
    console.error('Error trying to purge idb')
  }
}
