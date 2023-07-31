import { Borrow, BorrowDark, Dashboard, DashboardDark, Lend, LendDark } from '@frakt/icons'
import { PATHS } from '@frakt/router'

export const NAVIGATION_LINKS = [
  {
    pathname: PATHS.ROOT,
    label: 'Dashboard',
    icons: {
      light: Dashboard,
      dark: DashboardDark,
    },
  },
  {
    pathname: PATHS.BORROW,
    label: 'Borrow',
    icons: {
      light: Borrow,
      dark: BorrowDark,
    },
  },
  {
    pathname: PATHS.LOANS,
    label: 'My loans',
  },
  {
    pathname: PATHS.LEND,
    label: 'Lend',
    icons: {
      light: Lend,
      dark: LendDark,
    },
  },
]

export const SECONDARY_NAVIGATION_LINKS = [
  {
    pathname: PATHS.ADVENTURES,
    label: 'Banx',
  },
  {
    pathname: PATHS.LIQUIDATIONS,
    label: 'Raffles',
  },
  {
    pathname: PATHS.AUCTIONS,
    label: 'Auctions',
  },
]

export const DOCUMENTATIONS_LINKS = [
  {
    label: 'Docs',
    href: 'https://docs.frakt.xyz/frakt/',
  },
  {
    label: 'Medium',
    href: 'https://medium.com/@frakt_HQ',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/frakt-solana',
  },
]
