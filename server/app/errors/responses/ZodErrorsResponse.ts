import { H3Event, sendError, createError } from "h3"
import { getMappedZodErrors } from "../errorMapper"

export default async function sendZodErrorResponse(event: H3Event, zodError: any) {
  // getMappedZodErrors returns a plain object like { fieldName: { message: "..." } }
  const errors = getMappedZodErrors(zodError)

  // sendError with createError, pass the object directly
  return sendError(
    event,
    createError({
      statusCode: 422,
      statusMessage: "Invalid Data Provided",
      data: { errors } // wrap in 'errors' key
    })
  )
}
