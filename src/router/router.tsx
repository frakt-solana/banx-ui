import { FC, PropsWithChildren } from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@banx/Layout'
import { useFirebaseNotifications, useNotificationModal } from '@banx/hooks'
import { routes } from '@banx/router/routes'
import { useMixpanelUser } from '@banx/utils'

const InitialCalls: FC<PropsWithChildren> = ({ children }) => {
  useFirebaseNotifications()
  useNotificationModal()
  useMixpanelUser()

  return <>{children}</>
}

export const Router = () => {
  return (
    <BrowserRouter>
      <InitialCalls>
        <Routes>
          {routes.map(({ path, component: Component }, index) => (
            <Route
              key={index}
              path={path}
              element={
                <AppLayout>
                  <Component />
                </AppLayout>
              }
            />
          ))}
        </Routes>
      </InitialCalls>
    </BrowserRouter>
  )
}
