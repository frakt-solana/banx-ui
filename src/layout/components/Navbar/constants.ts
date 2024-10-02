import { DISCORD, DOCS_URL, GITHUB_URL, GOVERNANCE_URL, X_URL } from '@banx/constants'
import {
  Borrow,
  Dashboard,
  Discord,
  Docs,
  Github,
  Governance,
  Lend,
  Rewards,
  Twitter,
} from '@banx/icons'
import { StakeFilled } from '@banx/icons/Stake'
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
]

export const SECONDARY_NAVIGATION_LINKS = [
  {
    label: 'Rewards',
    pathname: PATHS.LEADERBOARD,
    icon: Rewards,
  },
  {
    label: 'Stake',
    pathname: PATHS.ADVENTURES,
    icon: StakeFilled,
  },
  {
    label: 'Governance',
    href: GOVERNANCE_URL,
    icon: Governance,
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
