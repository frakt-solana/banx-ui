import { ReactNode } from 'react'

export interface OptionKeys<ObjectType, KeyType extends keyof ObjectType = keyof ObjectType> {
  labelKey: keyof ObjectType

  valueKey: keyof ObjectType

  imageKey: keyof ObjectType

  labelIcon?: {
    key: keyof ObjectType
    icon: JSX.Element
  }

  secondLabel?: SecondLabel<ObjectType, KeyType>
}

/**
 * ? SecondLabel is a type that depends on ObjectType and KeyType.
 * ? If KeyType is a key of ObjectType, it returns an object type with a key and an optional format function.
 * ? Otherwise, it returns "never".
 */

type SecondLabel<ObjectType, KeyType extends keyof ObjectType> = KeyType extends keyof ObjectType
  ? {
      key: KeyType
      format?: (value: ObjectType[KeyType]) => ReactNode
    }
  : never
