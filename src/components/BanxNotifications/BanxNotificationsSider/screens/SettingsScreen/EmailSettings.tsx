import { FocusEvent, FormEvent } from 'react'

import { AddressType } from '@dialectlabs/react-sdk'

import { AddressInput, generateRightAddonProps } from './AddressInput'
import { AddressInputBottomContent } from './AddressInputBottomContent'
import { VerificationInput } from './VerificationInput'
import { useAddressSettings } from './hooks'

import styles from './SettingsScreen.module.less'

const UPDATE_WARNING_MESSAGE =
  "Updating your email here will update it across all dapps you've subscribed to."

const DELETE_WARNING_MESSAGE =
  "Deleting your email here will delete it for all dapps you've subscribed to."

export const EmailSettings = () => {
  const ADDRESS_TYPE = AddressType.Email

  const {
    currentValue,
    onCurrentValueChange,
    isLoading,
    isEditing,
    isDeleting,
    isAddressSaved,
    isVerified,
    createAddress,
    updateAddress,
    onUpdateCancel,
    onDeleteStart,
    deleteAddress,
    onDeleteCancel,
    error,
    setError,
    isSubscriptionEnabled,
    toggleSubscription,
  } = useAddressSettings({
    addressType: ADDRESS_TYPE,
  })

  const rightAddonProps = generateRightAddonProps({
    currentValue,
    isLoading,
    isEditing,
    isDeleting,
    isSaved: isAddressSaved,
    onCreate: createAddress,
    onUpdate: updateAddress,
    onDeleteStart,
    onDeleteConfirm: deleteAddress,
  })

  const onBlur = (event: FocusEvent<HTMLInputElement, Element>) => {
    event.target.checkValidity()
      ? setError(null)
      : setError({
          name: 'incorrectEmail',
          message: 'Please enter a valid email',
        })
  }

  const onFocus = () => {
    setError(null)
  }

  const onInvalid = (event: FormEvent<HTMLInputElement>) => {
    event.preventDefault()
    setError({
      name: 'incorrectEmail',
      message: 'Please enter a valid email',
    })
  }

  return (
    <div className={styles.emailSettings}>
      <p className={styles.settingsLabel}>Email</p>

      {isAddressSaved && !isVerified ? (
        <VerificationInput
          description="Check your email for a verification code."
          onCancel={deleteAddress}
          addressType={ADDRESS_TYPE}
        />
      ) : (
        <AddressInput
          placeholder="example@mail.com"
          type="email"
          value={currentValue}
          onChange={onCurrentValueChange}
          isError={!!error}
          onBlur={onBlur}
          onFocus={onFocus}
          onInvalid={onInvalid}
          pattern="^\S+@\S+\.\S+$"
          rightAddonProps={rightAddonProps}
        />
      )}
      <AddressInputBottomContent
        {...{
          updateWarningMessage: UPDATE_WARNING_MESSAGE,
          deleteWarningMessage: DELETE_WARNING_MESSAGE,
          error,
          isLoading,
          isEditing,
          isDeleting,
          isAddressSaved,
          isVerified,
          isSubscriptionEnabled,
          toggleSubscription,
          onUpdateCancel,
          onDeleteCancel,
        }}
      />
    </div>
  )
}
