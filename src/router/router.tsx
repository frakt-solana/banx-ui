import { FC, PropsWithChildren } from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@frakt/Layout'
import { routes } from '@frakt/constants/routes'
import { useFirebaseNotifications } from '@frakt/hooks'

const InitialCalls: FC<PropsWithChildren> = ({ children }) => {
  useFirebaseNotifications()

  return <>{children}</>
}

export const Router = (): JSX.Element => {
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
