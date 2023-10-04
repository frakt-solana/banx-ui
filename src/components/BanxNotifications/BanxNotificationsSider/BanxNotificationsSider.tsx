import { FC, useRef } from 'react'

import { useDialectSdk } from '@dialectlabs/react-sdk'
import classNames from 'classnames'

import { useOnClickOutside } from '@banx/hooks'

import { BUTTON_ID } from '../constants'
import { useBanxNotificationsSider } from '../hooks'
import { Header } from './Header'
import { ScreenType } from './constants'
import {
  LoadingScreen,
  /* NotificationsScreen,*/
  SettingsScreen,
  SignMessageScreen,
} from './screens'

import styles from './BanxNotificationsSider.module.less'

interface BanxNotificationsSiderProps {
  className?: string
}

export const BanxNotificationsSider: FC<BanxNotificationsSiderProps> = ({ className }) => {
  const sdk = useDialectSdk(true)

  const { isVisible, setVisibility, screenType } = useBanxNotificationsSider()

  const siderRef = useRef(null)

  useOnClickOutside(siderRef, (event) => {
    const targetAsHTMLElement = event.target as HTMLElement

    const targetId = targetAsHTMLElement.id
    const targetParentId = targetAsHTMLElement.closest(`#${BUTTON_ID}`)?.id

    const preventClick = targetId === BUTTON_ID || targetParentId === BUTTON_ID

    if (preventClick) return

    setVisibility(false)
  })

  //? Check if sdk exists to avoid "sdk is not initialized" error
  if (!sdk) return null

  return (
    <div
      onClick={(event) => event}
      className={classNames(styles.sider, { [styles.siderHidden]: !isVisible }, className)}
      ref={siderRef}
    >
      <Header />
      <>
        {screenType === ScreenType.SETTINGS && <SettingsScreen />}
        {screenType === ScreenType.LOADING && <LoadingScreen />}
        {screenType === ScreenType.SIGN_MESSAGE && <SignMessageScreen />}
        {/* {screenType === ScreenType.NOTIFICATIONS && <NotificationsScreen />} */}
      </>
    </div>
  )
}
