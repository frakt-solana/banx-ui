import { DISCORD, DOCS_URL, GITHUB_URL, X_URL } from '@banx/constants'
import {
  BanxFilled,
  Borrow,
  Dashboard,
  Discord,
  Docs,
  Github,
  Lend,
  Rewards,
  Twitter,
} from '@banx/icons'
import { PATHS } from '@banx/router'

export const NAVIGATION_LINKS = [
  {
    label: 'Dashboard',
    pathname: PATHS.DASHBOARD,
    icon: Dashboard,
    primary: true,
  },
  {
    label: 'Borrow',
    pathname: PATHS.BORROW,
    icon: Borrow,
    primary: true,
  },
  {
    label: 'My loans',
    pathname: PATHS.LOANS,
  },
  {
    label: 'Lend',
    pathname: PATHS.LEND,
    icon: Lend,
    primary: true,
  },
  {
    label: 'My offers',
    pathname: PATHS.OFFERS,
  },
  {
    label: 'Refinance',
    pathname: PATHS.REFINANCE,
  },
]

export const SECONDARY_NAVIGATION_LINKS = [
  {
    label: 'Rewards',
    pathname: PATHS.LEADERBOARD,
    icon: Rewards,
  },
  {
    label: 'Banx',
    pathname: PATHS.ADVENTURES,
    icon: BanxFilled,
  },
]

export const EXTERNAL_LINKS = [
  {
    label: 'X',
    href: X_URL,
    icon: Twitter,
  },
  {
    label: 'Discord',
    href: DISCORD.SERVER_URL,
    icon: Discord,
  },
  {
    label: 'Docs',
    href: DOCS_URL,
    icon: Docs,
  },
  {
    label: 'Github',
    href: GITHUB_URL,
    icon: Github,
  },
]
