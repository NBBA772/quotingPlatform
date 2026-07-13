import { z, parseBodyAs, } from "@sidebase/nuxt-parse"
import { H3Event } from "h3"

const bodySchema = z.object({
    username: z.string({
        required_error: 'username required',
    })
        .min(1, { message: 'username required' }),

    firstName: z.string({
        required_error: 'firstName required',
    })
        .min(1, { message: 'firstName required' }),
     lastName: z.string({
        required_error: 'lastName required',
    })
        .min(1, { message: 'lastName required' }),
phone: z.string({
        required_error: 'phone required',
    })
        .min(1, { message: 'phone required' }),
    email: z.string({
        required_error: 'valid email required',
    }).email({ message: 'valid email required' }),

    password: z.string({
        required_error: 'password required',
    })
        .min(8, { message: 'password must be at least 8 characters' })
})

export default async function registerRequest(event: H3Event) {
  const body = await readBody(event)
  return {
    username: body.username,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    password: body.password,
    // add company fields
    companyName: body.companyName,
    companyPhone: body.companyPhone,
    companyEmail: body.companyEmail,
    streetAddress: body.streetAddress,
    city: body.city,
    state: body.state,
    zipCode: body.zipCode,
    industry: body.industry,
    employeeSize: body.employeeSize,
    website: body.website,
    ein: body.ein,
    salesmanCode: body.salesmanCode
  }
}
