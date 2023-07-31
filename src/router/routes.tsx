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
    path: PATHS.BORROW,
    component: RootPage,
  },
  {
    path: PATHS.LOANS,
    component: RootPage,
  },
  {
    path: PATHS.LEND,
    component: RootPage,
  },
  {
    path: PATHS.ADVENTURES,
    component: RootPage,
  },
  {
    path: PATHS.LIQUIDATIONS,
    component: RootPage,
  },
  {
    path: PATHS.AUCTIONS,
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
