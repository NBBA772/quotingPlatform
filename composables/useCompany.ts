```ts
// composables/useAuth.ts

export interface CompanyInfo {
  id: number
  companyName: string
  ein?: string
  salesmanCode?: string
  industry: string

  streetAddress: string
  city: string
  state: string
  zipCode: string

  phoneNumber: string
  companyEmail: string
  website?: string
  employeeSize: string

  businessCode?: string

  agent?: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string
  } | null
}
```
