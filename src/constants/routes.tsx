import { FC } from 'react'

import RootPage from '@frakt/pages/RootPage/RootPage'

import { PATHS } from './paths'

interface Route {
  path: string
  component: FC
}

export const routes: Route[] = [
  {
    path: PATHS.ROOT,
    component: RootPage,
  },
  {
    path: PATHS.PAGE_404,
    component: RootPage,
  },
  {
    path: '*',
    component: RootPage,
  },
]
