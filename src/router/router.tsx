import { FC, PropsWithChildren } from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { useFirebaseNotifications } from '@frakt/hooks'
import { AppLayout } from '@frakt/layout'
import { routes } from '@frakt/router/routes'

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
