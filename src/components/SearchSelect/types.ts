import { ReactNode } from 'react'

export interface OptionKeys<DataType, KeyType extends keyof DataType = keyof DataType> {
  labelKey: KeyType
  valueKey: KeyType
  imageKey: KeyType

  labelIcon?: {
    key: KeyType
    icon: JSX.Element
  }

  secondLabel?: SecondLabel<DataType, KeyType>
}

/**
 * ? SecondLabel is a type that depends on DataType and KeyType.
 * ? If KeyType is a key of DataType, it returns an object type with a key and an optional format function.
 * ? Otherwise, it returns "never".
 */

type SecondLabel<DataType, KeyType extends keyof DataType> = KeyType extends keyof DataType
  ? {
      key: KeyType
      format?: (value: DataType[KeyType]) => ReactNode
    }
  : never
