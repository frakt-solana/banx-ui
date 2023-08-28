import moment from 'moment'

export const calculateTimeFromNow = (seconds: number) => {
  return moment.unix(moment().unix() + seconds).toNow(true)
}
