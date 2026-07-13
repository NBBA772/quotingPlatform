// Underwriting question sets, keyed by product.
// Shared by the enrollment pages (render + validate) and the PDF generator (print Q&A).

export interface UnderwritingQuestion {
  id: string
  text: string
  type: 'yesno' | 'text'
  // when a yes/no answer equals this value, a details text box is required
  detailsIf?: boolean
  detailsLabel?: string
}

export interface UnderwritingProduct {
  key: string
  label: string
  questions: UnderwritingQuestion[]
}

const generalHealthQuestions: UnderwritingQuestion[] = [
  {
    id: 'tobacco',
    text: 'Has any applicant used tobacco or nicotine products in the last 12 months?',
    type: 'yesno',
  },
  {
    id: 'declined',
    text: 'Has any applicant ever been declined, postponed, or rated for insurance coverage?',
    type: 'yesno',
    detailsIf: true,
    detailsLabel: 'Please provide details',
  },
  {
    id: 'hospitalized',
    text: 'In the past 2 years, has any applicant been hospitalized or advised to have surgery that has not yet been performed?',
    type: 'yesno',
    detailsIf: true,
    detailsLabel: 'Please provide details',
  },
  {
    id: 'fiveYearMajorCondition',
    text: 'In the past 2 years, have you had cancer, heart attack or stroke, autoimmune disease, kidney failure, or liver disease?',
    type: 'yesno',
    detailsIf: true,
    detailsLabel: 'Condition, date of diagnosis, and treatment',
  },
  {
    id: 'dui',
    text: 'In the past 2 years, have you been convicted of or charged with driving under the influence (DUI/DWI)?',
    type: 'yesno',
    detailsIf: true,
    detailsLabel: 'Date and details',
  },
  {
    id: 'substanceAbuse',
    text: 'Have you ever been diagnosed with, treated for, or advised to seek treatment for drug or alcohol abuse?',
    type: 'yesno',
    detailsIf: true,
    detailsLabel: 'Substance, treatment, and current status',
  },
  {
    id: 'diabetesComplications',
    text: 'If you have diabetes, have you experienced any complications (such as neuropathy, retinopathy, kidney disease, or amputation)?',
    type: 'yesno',
    detailsIf: true,
    detailsLabel: 'Please describe the complications',
  },
]

// Sections always asked, regardless of which products are selected
export const ALWAYS_ASKED_KEYS = ['generalHealth', 'mentalHealth']

export const underwritingProducts: UnderwritingProduct[] = [
  {
    key: 'generalHealth',
    label: 'General Health',
    questions: generalHealthQuestions,
  },
  {
    key: 'mentalHealth',
    label: 'Mental Health',
    questions: [
      {
        id: 'mentalIllness',
        text: 'In the past 2 years, have you been diagnosed with, treated for, or hospitalized for a mental illness (such as depression, manic depression, bipolar disorder, PTSD, or schizophrenia)?',
        type: 'yesno',
        detailsIf: true,
        detailsLabel: 'Condition, treatment, and current status',
      },
    ],
  },
  {
    key: 'hospitalIndemnity',
    label: 'Hospital Indemnity',
    questions: [

      {
        id: 'plannedAdmission',
        text: 'Does any applicant have a planned or anticipated hospital admission (including maternity)?',
        type: 'yesno',
        detailsIf: true,
        detailsLabel: 'Please provide details',
      },
    ],
  },
  {
    key: 'shortTermDisability',
    label: 'Short-Term Disability',
    questions: [

      {
        id: 'currentlyDisabled',
        text: 'Is any applicant currently unable to work, or has any applicant received disability benefits in the past 2 years?',
        type: 'yesno',
        detailsIf: true,
        detailsLabel: 'Please provide details',
      },
    ],
  },
]

export function getProductByKey(key: string): UnderwritingProduct | undefined {
  return underwritingProducts.find((p) => p.key === key)
}

// Ancillary product names (free text on the application) are matched to a
// question set by loose label match; products without a set return undefined.
export function matchAncillaryProduct(productName: string | null | undefined): UnderwritingProduct | undefined {
  const name = (productName || '').toLowerCase()
  return underwritingProducts.find(
    (p) =>
      !ALWAYS_ASKED_KEYS.includes(p.key) &&
      name.includes(p.label.toLowerCase().split('-')[0].trim().toLowerCase()),
  )
}
