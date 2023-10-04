import { ChangeEvent, useEffect, useState } from 'react'

import {
  AddressType,
  useDialectSdk,
  useNotificationChannel,
  useNotificationChannelDappSubscription,
  useNotificationSubscriptions,
} from '@dialectlabs/react-sdk'

import { DIALECT } from '@banx/constants'

interface UseAddressSettingsProps {
  addressType: AddressType
}

type CreateUpdateAddress = (props?: { formatter?: (v: string) => string }) => Promise<void>

export const useAddressSettings = ({ addressType }: UseAddressSettingsProps) => {
  const {
    globalAddress: address,
    create,
    delete: remove,
    update,

    isCreatingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isSendingCode,
    isVerifyingCode,

    errorFetching: errorFetchingAddresses,
  } = useNotificationChannel({ addressType })

  const {
    enabled: isSubscriptionEnabled,
    toggleSubscription: toggleDappSubscription,
    isToggling,
  } = useNotificationChannelDappSubscription({
    addressType,
    dappAddress: DIALECT.APP_PUBLIC_KEY,
  })

  const [currentValue, setCurrentValue] = useState(address?.value || '')
  const [isDeleting, setIsDeleting] = useState(false)

  const [error, setError] = useState<Error | null>(null)

  const isAddressSaved = Boolean(address)
  const isVerified = address?.verified || false

  const isLoading =
    isCreatingAddress ||
    isUpdatingAddress ||
    isDeletingAddress ||
    isSendingCode ||
    isVerifyingCode ||
    isToggling

  useEffect(() => {
    setCurrentValue(address?.value || '')
  }, [isAddressSaved, address?.value])

  const onCurrentValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(event.target.value)
  }

  const createAddress: CreateUpdateAddress = async (props) => {
    try {
      if (error) return
      const formatter = props?.formatter || ((v) => v)
      const address = await create({ value: formatter(currentValue) })
      await toggleDappSubscription({ enabled: true, address })
      setError(null)
    } catch (error) {
      setError(error as Error)
    }
  }

  const updateAddress: CreateUpdateAddress = async (props) => {
    try {
      if (error) return
      const formatter = props?.formatter || ((v) => v)
      await update({ value: formatter(currentValue) })
      setError(null)
    } catch (error) {
      setError(error as Error)
    }
  }

  const onDeleteStart = () => setIsDeleting((prev) => !prev)
  const onUpdateCancel = () => setCurrentValue(address?.value || '')

  const deleteAddress = async () => {
    try {
      await remove()
      setIsDeleting(false)
      setError(null)
    } catch (error) {
      setError(error as Error)
    }
  }

  const onDeleteCancel = () => setIsDeleting(false)

  const toggleSubscription = async (nextValue: boolean) => {
    try {
      await toggleDappSubscription({
        enabled: nextValue,
      })
      setError(null)
    } catch (error) {
      setError(error as Error)
    }
  }

  return {
    currentValue,
    onCurrentValueChange,
    error: error || errorFetchingAddresses,
    setError,
    createAddress,
    updateAddress,
    onUpdateCancel,
    onDeleteStart,
    deleteAddress,
    onDeleteCancel,
    isSubscriptionEnabled,
    toggleSubscription,
    isLoading,
    isEditing: currentValue !== address?.value && isAddressSaved,
    isDeleting,
    isVerified,
    isAddressSaved,
  }
}

const buildBotUrl = (botUsername: string) => `https://t.me/${botUsername}?start=${botUsername}`

export const useDialectTelegramBotURL = () => {
  const {
    config: { environment },
  } = useDialectSdk()

  const defaultBotUrl =
    environment === 'production' ? buildBotUrl('DialectLabsBot') : buildBotUrl('DialectLabsDevBot')

  return defaultBotUrl
}

export const useDialectSettingsLoading = () => {
  const { isFetching: subscriptionsLoading } = useNotificationSubscriptions({
    dappAddress: DIALECT.APP_PUBLIC_KEY,
  })

  //? Fetching one source (email) is enough
  const { isFetchingSubscriptions: isFetchingEmail } = useNotificationChannelDappSubscription({
    addressType: AddressType.Email,
    dappAddress: DIALECT.APP_PUBLIC_KEY,
  })

  return subscriptionsLoading || isFetchingEmail
}
