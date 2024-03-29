import { BN } from 'fbonds-core'

export const bnToFixed = (value: BN, decimal: number = 1e9): string => {
  const stringValue = value.toString();

  return (stringValue / decimal).toString()

}

export const convertToBN = <T extends object>(obj: T):{ [K in keyof T]: BN }  =>   {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const result: { [K in keyof T]: BN | string } = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && !isNaN(Number(value))) {
      result[key as keyof T] = new BN(value);
    } else {

      result[key as keyof T] = value;
    }
  }



  return result;
}
