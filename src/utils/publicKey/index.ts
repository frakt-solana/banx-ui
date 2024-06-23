import { web3 } from 'fbonds-core'
import { uniqWith } from 'lodash'

export const arePublicKeysEqual = (
  publicKeyA: web3.PublicKey,
  publicKeyB: web3.PublicKey,
): boolean => publicKeyA.equals(publicKeyB)

export const removeDuplicatedPublicKeys = (
  publicKeys: Array<web3.PublicKey>,
): Array<web3.PublicKey> => uniqWith(publicKeys, arePublicKeysEqual)
