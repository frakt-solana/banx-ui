import { BN } from 'fbonds-core'
import { chain, isObject } from 'lodash'

const calcObjectsDiff = <T extends Record<string, unknown>>(
  objectA: T,
  objectB: T,
  ignoreFields: string[],
  diffMethod: 'add' | 'sub' = 'sub',
): T => {
  return chain(objectA)
    .toPairs()
    .map(([fieldName, fieldValue]) => {
      if (ignoreFields.includes(fieldName)) {
        return [fieldName, objectB[fieldName]]
      }

      if (BN.isBN(fieldValue)) {
        if (diffMethod === 'add') {
          return [fieldName, fieldValue.add(objectB[fieldName] as BN)]
        }
        return [fieldName, fieldValue.sub(objectB[fieldName] as BN)]
      }

      if (isObject(fieldValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return calcObjectsDiff<any>(fieldValue, objectB[fieldName], ignoreFields, diffMethod)
      }

      return [fieldName, objectB[fieldName]]
    })
    .fromPairs()
    .value() as T
}

export const calcOptimisticBasedOnBulkSimulation = <T extends Record<string, unknown>>(
  account: T,
  simulatedAccounts: T[],
  ignoreFields: string[] = [],
): T => {
  const diffs = simulatedAccounts.map((simulatedAccount) =>
    calcObjectsDiff(account, simulatedAccount, ignoreFields, 'sub'),
  )

  return chain(diffs)
    .reduce((acc, diff) => {
      return calcObjectsDiff(acc, diff, ignoreFields, 'sub')
    }, account)
    .value() as T
}
