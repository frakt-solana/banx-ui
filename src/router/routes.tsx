import { FC } from 'react'

import {
  AdventuresPage,
  BorrowPage,
  DashboardPage,
  LeaderboardPage,
  LendPage,
  LoansPage,
  OffersPage,
  RefinancePage,
  RootPage,
} from '@banx/pages'

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
    path: PATHS.DASHBOARD,
    component: DashboardPage,
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
    path: PATHS.OFFERS,
    component: OffersPage,
  },
  {
    path: PATHS.ADVENTURES,
    component: AdventuresPage,
  },
  {
    path: PATHS.REFINANCE,
    component: RefinancePage,
  },
  {
    path: PATHS.LEADERBOARD,
    component: LeaderboardPage,
  },
  {
    path: PATHS.PAGE_404, //? Why don't we have page 404?
    component: RootPage,
  },
  {
    path: '*',
    component: RootPage,
  },
]
