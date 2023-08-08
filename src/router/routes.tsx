import { FC } from 'react'

import { LendPage, LoansPage, RootPage } from '@banx/pages'

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
    component: LoansPage,
  },
  {
    path: PATHS.LEND,
    component: LendPage,
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
