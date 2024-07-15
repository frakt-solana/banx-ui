import { ZodArray, ZodObject } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateResponse = async (data: unknown, schema: ZodObject<any> | ZodArray<any>) => {
  try {
    await schema.parseAsync(data)
  } catch (validationError) {
    //TODO Throw error when BE satisfyies schema
    console.error('Schema validation error:', validationError)
  }
}
