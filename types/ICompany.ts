export interface ICompany {
  id?: number
  companyName: string          // <- make sure this exists in the data
  ein?: string
  salesmanCode?: string
  industry: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  phoneNumber: string         // <- NOT phone
  companyEmail: string        // <- NOT email
  website?: string
  employeeSize: string
  adminId?: number
}
