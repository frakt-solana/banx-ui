import { useState } from 'react'

import { RBOption, RadioButton } from '@banx/components/RadioButton'
import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'

import { getTableColumns } from './columns'

import styles from './LeaderboardTab.module.less'

const LeaderboardTab = () => {
  const columns = getTableColumns()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: usersData })

  const [currentOption, setCurrentOption] = useState<RBOption>(options[0])

  return (
    <>
      <RadioButton
        className={styles.radioButton}
        options={options}
        currentOption={currentOption}
        onOptionChange={setCurrentOption}
      />
      <>
        <Table data={data} columns={columns} rowKeyField="userAddress" />
        <div ref={fetchMoreTrigger} />
      </>
    </>
  )
}

export default LeaderboardTab

export interface LeaderboardUserData {
  rank: number
  userAvatar: string
  userAddress: string
  points: number
  loyalty: number
}

const usersData: LeaderboardUserData[] = [
  {
    rank: 1,
    userAvatar: 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small',
    userAddress: '3FtGuJ7sT6k1d1gjHbs9gNMS1dD4jUeKW1c6m1abcde',
    points: 233424,
    loyalty: 100,
  },
  {
    rank: 2,
    userAvatar: 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small',
    userAddress: '7a9DmH6kLkMnp2r8eW3b8gf1dQ4rTzWqFhN9a2xyzab',
    points: 213424,
    loyalty: 95,
  },
  {
    rank: 3,
    userAvatar: 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small',
    userAddress: '9o2RmP8sY6dVf7gH1mN2jS5rM8mPzH3dA5b4c3defg',
    points: 185267,
    loyalty: 68,
  },
  {
    rank: 4,
    userAvatar: 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small',
    userAddress: '2s1o4m5e6l7o8n9g0u1y2s3t4r5e6e7t8',
    points: 176900,
    loyalty: 83,
  },
  {
    rank: 5,
    userAvatar: 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small',
    userAddress: '1v2e3r4y5l6o7n8g9w0a1l2l3e4t5h6i7s8a9r0e1a2l3l4y5a6w7e8s9o0m1e2',
    points: 136855,
    loyalty: 100,
  },
  {
    rank: 6,
    userAvatar: 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small',
    userAddress: '4c0e4d4a4r4r4o4a4d4h4i4g4h4l4a4n4d4s4',
    points: 132970,
    loyalty: 64,
  },
  {
    rank: 7,
    userAvatar: 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small',
    userAddress: '3h0t3m4a5p6t7o8l9a0k1e2y3o4u5r6d7e8s9s0',
    points: 128670,
    loyalty: 32,
  },
]

const options: RBOption[] = [
  {
    label: 'Lender',
    value: 'lender',
  },
  {
    label: 'Borrower',
    value: 'borrower',
  },
]
