import { FC } from 'react'

import { BorrowPage, LendPage, LoansPage, RefinancePage, RootPage } from '@banx/pages'

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
    component: BorrowPage,
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
    path: PATHS.REFINANCE,
    component: RefinancePage,
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
