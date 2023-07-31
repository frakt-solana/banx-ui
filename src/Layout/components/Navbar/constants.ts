import { PATHS } from '@frakt/constants'
import { Borrow, BorrowDark, Dashboard, DashboardDark, Lend, LendDark } from '@frakt/icons'

export const NAVIGATION_LINKS = [
  {
    pathname: PATHS.ROOT,
    label: 'Dashboard',
    icon: Dashboard,
    iconDark: DashboardDark,
    primary: true,
  },
  {
    pathname: PATHS.BORROW_ROOT,
    label: 'Borrow',
    icon: Borrow,
    iconDark: BorrowDark,
    primary: true,
  },
  {
    pathname: PATHS.LOANS,
    label: 'My loans',
  },
  {
    pathname: PATHS.BONDS_LITE,
    label: 'Lend',
    icon: Lend,
    iconDark: LendDark,
    primary: true,
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
