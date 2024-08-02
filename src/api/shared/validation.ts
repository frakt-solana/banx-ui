import { ZodType } from 'zod'

// //TODO What to do if BE data doesn't satisfy schema?
// export const validateResponse = async <T>(
//   data: unknown,
//   schema: ZodType<T>,
// ): Promise<T | undefined> => {
//   try {
//     return await schema.parseAsync(data)
//   } catch (validationError) {
//     console.error('Schema validation error:', validationError)
//     return undefined
//   }
// }

export const parseResponseSafe = async <T>(
  data: unknown,
  schema: ZodType<unknown>,
): Promise<T | undefined> => {
  try {
    return (await schema.parseAsync(data)) as T
  } catch (validationError) {
    console.error('Schema validation error:', { validationError })
    return undefined
  }
}
