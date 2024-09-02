import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Toggle } from '@banx/components/Toggle'

import styles from './SettingsScreen.module.less'

const DEFAULT_UPDATE_WARNING_MESSAGE =
  "Updating your address handle here will update it across all dapps you've signed up."

const DEFAULT_DELETE_WARNING_MESSAGE =
  "Deleting your telegram handle here will delete it across all dapps you've signed up."

interface AddressInputBottomContentProps {
  updateWarningMessage?: string
  deleteWarningMessage?: string
  error: Error | null
  isLoading: boolean
  isEditing: boolean
  isDeleting: boolean
  isAddressSaved: boolean
  isVerified: boolean
  isSubscriptionEnabled: boolean
  toggleSubscription: (nextValue: boolean) => Promise<void>
  onUpdateCancel: () => void
  onDeleteCancel: () => void
}

export const AddressInputBottomContent: FC<AddressInputBottomContentProps> = ({
  updateWarningMessage = DEFAULT_UPDATE_WARNING_MESSAGE,
  deleteWarningMessage = DEFAULT_DELETE_WARNING_MESSAGE,
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
}) => {
  return (
    <>
      {!!error?.message && <p className={styles.addressErrorText}>{error?.message}</p>}
      {isEditing && (
        <div className={styles.addressInputDescription}>
          <p className={styles.addressInputDescriptionText}>{updateWarningMessage}</p>
          <Button onClick={onUpdateCancel} size="medium">
            Cancel
          </Button>
        </div>
      )}
      {isDeleting && !isEditing && (
        <div className={styles.addressInputDescription}>
          <p className={styles.addressInputDescriptionText}>{deleteWarningMessage}</p>
          <Button onClick={onDeleteCancel} size="medium" variant="secondary">
            Cancel
          </Button>
        </div>
      )}
      {isAddressSaved && isVerified && !isEditing && (
        <Toggle
          className={styles.addressInputToggle}
          onChange={() => {
            if (isLoading) return
            toggleSubscription(!isSubscriptionEnabled)
          }}
          label={`Notifications ${isSubscriptionEnabled ? 'on' : 'off'}`}
          checked={isSubscriptionEnabled}
        />
      )}
    </>
  )
}
