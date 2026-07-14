<template>
  <div class="mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <!-- <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
      {{ isExisting ? 'Sign Your Insurance Application' : 'Insurance Application' }}
    </h2> -->

    <div v-for="app in applications" :key="app.id" class="border p-4 rounded-md mb-4">

      <!-- Already signed -->
      <div v-if="app.pdfUrl">
        <p class="text-green-600 dark:text-green-400 font-medium">
          You have already signed this application.
        </p>
        <button @click="downloadExistingPdf(app.pdfUrl)"
                class="mt-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45]">
          Download PDF
        </button>
      </div>

      <!-- Sign form -->
      <form v-else @submit.prevent="submitForm(app)" class="space-y-4">
      <!-- Group Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Group #</label>
              <input type="text" v-model="app.groupNumber"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required disabled />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Name of Group</label>
              <input type="text" v-model="app.groupName"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required disabled />
            </div>
          </div>






          <!-- Reason for Enrollment -->
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2" >
              Reason for Enrollment (Mark all that apply)
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label class="flex items-center">
                <input type="checkbox" value="New Group" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">New Group</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Open Enrollment" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Open Enrollment</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="New Hire" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">New Hire</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="New Application" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">New Application</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Newborn" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Newborn</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Court Order" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Court Order</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Dependent Addition" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Dependent Addition</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Loss of Coverage" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Loss of Coverage</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Marriage" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Marriage</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Divorce" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Divorce</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="Military Leave" v-model="app.reasons"
                  class="mr-2 accent-gray-800 dark:accent-gray-200" >
                <span class="text-gray-800 dark:text-gray-200">Military Leave</span>
              </label>
            </div>
          </div>





          <!-- Personal Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">First Name</label>
              <input type="text" v-model="app.firstName"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Middle Name</label>
              <input type="text" v-model="app.middleName"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Last Name</label>
              <input type="text" v-model="app.lastName"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
          </div>

          <!-- Contact -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Phone Number</label>
              <input type="text" v-model="app.phoneNumber"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Email</label>
              <input type="email" v-model="app.email"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
          </div>


          <!-- Address -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Street Address</label>
              <input type="text" v-model="app.streetAddress"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">City</label>
              <input type="text" v-model="app.city"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">State / Province</label>
              <input type="text" v-model="app.state"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">ZIP / Postal Code</label>
              <input type="text" v-model="app.zipCode"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
          </div>

          <!-- Identity -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Social Security Number</label>
              <input type="text" v-model="app.socialSecurityNumber"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Date Of Birth</label>
              <input type="date" v-model="app.dateOfBirth"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
          </div>









           <!-- Demographics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Age</label>
              <input type="text" v-model="app.age"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Gender</label>
              <input type="text" v-model="app.gender"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Weight</label>
              <input type="text" v-model="app.weight"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Height</label>
              <input type="text" v-model="app.height"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
          </div>














           <!-- Company -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Hire Date</label>
              <input type="text" :value="formatDate(app.hireDate)" 
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required  />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Rehire Date</label>
              <input type="date" :value="formatDate(app.rehireDate)" 
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Location</label>
              <input type="text" v-model="app.location"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Division</label>
              <input type="text" v-model="app.isDivision"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Parent Company</label>
              <input type="text" v-model="app.parentCompany"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
          </div>






           <!-- Job Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Job Title</label>
              <input type="text" v-model=app.jobTitle
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Hours Per Week</label>
              <input type="text" v-model=app.hrsPerWeek
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      />
            </div>
          </div>








<!-- Spouse Section -->
<h2>Spouse</h2>
<div class="mb-4 border p-4 rounded bg-gray-50 dark:bg-[#2d3a2a]">
  <label class="block mb-2 text-gray-700 dark:text-gray-300">First Name</label>
  <input v-model="app.spouseFirstName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Middle Name</label>
  <input v-model="app.spouseMiddleName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Last Name</label>
  <input v-model="app.spouseLastName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Social Security Number</label>
  <input v-model="app.spouseSocialSecurityNumber" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Date Of Birth</label>
  <input :value="formatForDateInput(app.spouseDateOfBirth)" @input="app.spouseDateOfBirth = $event.target.value" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Age</label>
  <input v-model="app.spouseAge" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Gender</label>
  <input v-model="app.spouseGender" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Weight</label>
  <input v-model="app.spouseWeight" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Height</label>
  <input v-model="app.spouseHeight" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
</div>

<!-- Dependents -->
<h2>Dependents</h2>
<div v-for="(dep, index) in app.dependents" :key="index"
     class="mb-4 border p-4 rounded bg-gray-50 dark:bg-[#2d3a2a]">
  <label class="block mb-2 text-gray-700 dark:text-gray-300">First Name</label>
  <input v-model="dep.firstName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Last Name</label>
  <input v-model="dep.lastName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Social Security Number</label>
  <input v-model="dep.socialSecurityNumber" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Weight</label>
  <input v-model="dep.weight" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Height</label>
  <input v-model="dep.height" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Date of Birth</label>
  <input :value="formatForDateInput(dep.dateOfBirth)" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Gender</label>
  <select v-model="dep.gender" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" >
    <option value="Male">Male</option>
    <option value="Female">Female</option>
  </select>

  <label class="block mb-2 text-gray-700 dark:text-gray-300 mt-2">Relationship</label>
  <input v-model="dep.relationship" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
</div>










     <!-- Health Plan -->
<div v-if="form.healthPlan !== ''">
  <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
    Health Plan
  </label>

  <select
    v-model="app.healthPlan"
    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
    required
    disabled
  >
    <option value="">Select Health Plan</option>
    <option value="plan1">Plan 1</option>
    <option value="plan2">Plan 2</option>
  </select>


</div>

<div v-else>
  <strong>Call agent to select health plan</strong>
  <!-- Agent Info -->
   {{ company.companyName }}
  <div
    v-if="company?.agent"
    class="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2d3a2a]"
  >
    <h3 class="font-semibold text-gray-800 dark:text-white mb-2">
      Assigned Insurance Agent
    </h3>

    <p class="text-gray-700 dark:text-gray-300">
      <strong>Name:</strong>
      {{ company.agent.firstName }} {{ company.agent.lastName }}
    </p>

    <p class="text-gray-700 dark:text-gray-300">
      <strong>Phone:</strong>
      {{ company.agent.phone || 'N/A' }}
    </p>

    <p class="text-gray-700 dark:text-gray-300">
      <strong>Email:</strong>
      {{ company.agent.email }}
    </p>
  </div>

</div>





          <!-- Vision And Dental Plan -->
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Do you need Vision and Dental coverage?
            </label>
            <select v-model="app.visionAndDentalPlan"
                    :disabled="!isAgent"
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                    required>
              <option :value="null">Select an option</option>
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>

          </div>







          <!-- Ancillary Plans -->
          <div v-if="app.ancillaryPlans?.length">
            <h2 class="mt-6 text-xl font-semibold text-gray-800 dark:text-gray-200">
              Ancillary Plans
            </h2>
            <div v-for="(plan, index) in app.ancillaryPlans" :key="index"
                 class="mb-4 border p-4 rounded bg-gray-50 dark:bg-[#2d3a2a]">
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company</label>
              <input v-model="plan.planName" type="text"
                     class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                     disabled />
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Product</label>
              <input v-model="plan.product" type="text"
                     class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                     disabled />

              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1 mt-2">Price</label>
              <input v-model="plan.price" type="number" step="0.01"
                     class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                     disabled />
            </div>
          </div>




          <template v-if="form.waiveOneTimeFee !== null">
            <!-- Signature Pad -->
            <div class="signature-container mt-4">
            <SignaturePad   class="w-full h-40 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#3a3a3a]" :ref="el => { if (el) signaturePads[app.id!] = el }" />
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-2 italic">
                *Sign Here
              </p>
            </div>

            <!-- E-sign consent -->
            <div class="flex items-center mt-2">
              <input type="checkbox" v-model="consent[app.id!]" id="consent-{{app.id}}" class="mr-2">
              <label for="consent-{{app.id}}" class="text-gray-700 dark:text-gray-300">
                I consent to e-sign this application
              </label>
            </div>

            <!-- Submit -->
            <button type="submit"
                    :disabled="!consent[app.id!]"
                    class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45]">
              {{ isExisting ? 'Sign & Generate PDF' : 'Submit & Generate PDF' }}
            </button>
        </template>
      </form>
    </div>

    <!-- Download Button for last signed PDF -->
    <!-- <div v-if="pdfDownloadUrl" class="mt-4">
      <button @click="downloadPdf"
              class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45]">
        Download PDF
      </button>
    </div> -->

    <!-- Success / Error Messages -->
    <p v-if="message" class="text-green-600 dark:text-green-400 mt-2">{{ message }}</p>
    <p v-if="error" class="text-red-600 dark:text-red-400 mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import SignaturePad from 'vue3-signature-pad'
import { useCookie } from '#imports'

const form = reactive({
  groupNumber: '',
  groupName: '',
  healthPlan: '',
  waiveOneTimeFee: null,
})

const company = ref<companyResponse | null>(null)

interface companyResponse {
  id: number,
  companyName: string,
  agent: {
    firstName: string,
    lastName: string,
    phone: string,
    email: string
  }

}

interface InsuranceApplication {
  id?: number,
  groupNumber: string,
  groupName: string,
  healthPlan?: string,
  visionAndDentalPlan?: boolean,
  firstName: string,
  middleName: string
  lastName: string,
  phoneNumber: string,
  email: string,
  streetAddress: string,
  city: string,
  state: string,
  zipCode: string,
  socialSecurityNumber: string,
  dateOfBirth : string
  hireDate: string,
  location: string,
  isDivision: boolean,
  parentCompany: string,
  rehireDate : string,
  age: string,
  gender: string,
  weight: string,
  height: string,
  pdfUrl?: string,
  reasons: string[],
  jobTitle: string,
  hrsPerWeek: string,
  spouseFirstName?: string,
  spouseMiddleName?: string,
  spouseLastName?: string,
  spouseSocialSecurityNumber?: string,
  spouseDateOfBirth?: string,
  spouseAge?: string,
  spouseGender?: string,
  spouseWeight?: string,
  spouseHeight?: string,

dependents: {
  firstName: string
  lastName: string
  socialSecurityNumber: string
  weight: string
  height: string
  dateOfBirth: string
  gender: string
  relationship: string
}[],
ancillaryPlans: [
    { name: '', product:'', price: null }
  ]

}


const signaturePads = reactive<Record<number, InstanceType<typeof SignaturePad>>>({})
const pdfDownloadUrl = ref<string | null>(null)
const message = ref('')
const error = ref('')
const isExisting = ref(false)
const consent = reactive<Record<number, boolean>>({})

const applications = ref<InsuranceApplication[]>([])

// After fetching applications
applications.value.forEach(app => {
  if (!app.dependents) {
    app.dependents = []
  }
})

const user = await useUser()












async function submitForm(app: InsuranceApplication) {
  const pad = signaturePads[app.id!]?.signaturePad

  if (!pad || pad.isEmpty()) {
    error.value = 'Please sign before submitting!'
    return
  }

  if (!consent[app.id!]) {
    error.value = 'You must consent to e-sign this application.'
    return
  }

  error.value = ''
  message.value = ''

  try {
    const signatureDataUrl = pad.toDataURL()

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // --- Page 1: All existing content except signature ---
    const page1 = pdfDoc.addPage([612, 792])
    const { height } = page1.getSize()

    // --- Embed logo ---
    const logoUrl = '/img/logo.png'
    const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer())
    const logoImage = await pdfDoc.embedPng(logoBytes)
    const logoDims = logoImage.scale(0.45)

    

    page1.drawImage(logoImage, { x: 10, y: height - 60, width: logoDims.width, height: logoDims.height })
    page1.drawText("Small Business Health Insurance Application", { x: 100, y: height - 50, size: 20, font: helveticaBold })

    // Group Info box
    page1.drawRectangle({ x: 20, y: height - 220, width: 180, height: 140, borderColor: rgb(0, 0, 0), borderWidth: 1 })
    page1.drawText("Group Information", { x: 40, y: height - 110, size: 14, font: helveticaBold })
    page1.drawText(`Group #: ${app.groupNumber}`, { x: 40, y: height - 130, size: 12 })
    page1.drawText(`Group Name: ${app.groupName}`, { x: 40, y: height - 150, size: 12 })
    // page1.drawText(`Effective Date: ${app.effectiveDate || ""}`, { x: 40, y: height - 170, size: 12 })
    // page1.drawText(`New Hire Waiting Period: ${app.waitingPeriod || ""}`, { x: 40, y: height - 190, size: 12 })



    // Reasons for Enrollment box
    page1.drawRectangle({ x: 210, y: height - 220, width: 380, height: 140, borderColor: rgb(0, 0, 0), borderWidth: 1 })
    page1.drawText("Reasons for Enrollment (Mark all that apply)", { x: 230, y: height - 110, size: 14, font: helveticaBold })

    const reasons = [
    "New Group", "Open Enrollment", "New Hire", "New Application",
    "Newborn", "Court Order", "Dependent Addition", "Loss of Coverage",
    "Marriage", "Divorce", "Military Leave"
  ]

  const colX = 230, colY = height - 130, colSpacing = 120, rowSpacing = 15
  const half = Math.ceil(reasons.length / 2)

  reasons.forEach((reason, i) => {
    const isSecondCol = i >= half
    const x = isSecondCol ? colX + colSpacing : colX
    const y = isSecondCol ? height - 130 - ((i - half) * rowSpacing) : colY - (i * rowSpacing)

    // Draw empty checkbox
    page1.drawRectangle({
      x,
      y: y - 2,
      width: 10,
      height: 10,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })

    // Label
    page1.drawText(reason, { x: x + 15, y, size: 11 })

    // ✅ If selected, draw an X inside the checkbox
    if (app.reasons.includes(reason)) {
      page1.drawText("X", { x: x + 2, y: y - 1, size: 10, font: helveticaBold })
    }
  })



    
   


    // Employer Info Heading
    const employerY = height - 250
    page1.drawText("Employer Information", { 
      x: 20, 
      y: employerY, 
      size: 16, 
      font: helveticaBold 
    })
    page1.drawLine({ 
      start: { x: 20, y: employerY - 3 }, 
      end: { x: 592, y: employerY - 3 }, 
      thickness: 1, 
      color: rgb(0, 0, 0) 
    })

if (user?.id) {
  company.value = await useCompany(String(user.id))
}

    // Row 1
    let employerRowY = employerY - 20
    page1.drawText("Employer:", { x: 20, y: employerRowY, size: 10, font: helveticaBold })
    page1.drawText(company?.companyName || "", { x: 70, y: employerRowY, size: 10, font: helvetica })
    page1.drawLine({ start: { x: 70, y: employerRowY - 2 }, end: { x: 280, y: employerRowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

    page1.drawText("Hire Date:", { x: 285, y: employerRowY, size: 10, font: helveticaBold })
    page1.drawText(formatDate(app.hireDate) || "", { x: 335, y: employerRowY, size: 10, font: helvetica })
    page1.drawLine({ start: { x: 335, y: employerRowY - 2 }, end: { x: 430, y: employerRowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

    page1.drawText("Rehire Date:", { x: 432, y: employerRowY, size: 10, font: helveticaBold })
    page1.drawText(formatDate(app.rehireDate) || "", { x: 500, y: employerRowY, size: 10, font: helvetica })
    page1.drawLine({ start: { x: 497, y: employerRowY - 2 }, end: { x: 592, y: employerRowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

    // Row 2
    employerRowY -= 20
    page1.drawText("Location:", { x: 20, y: employerRowY, size: 10, font: helveticaBold })
    page1.drawText(app.location || "", { x: 65, y: employerRowY, size: 10, font: helvetica })
    page1.drawLine({ start: { x: 65, y: employerRowY - 2 }, end: { x: 200, y: employerRowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

    page1.drawText("Is this a division?", { x: 220, y: employerRowY, size: 10, font: helveticaBold })

    // Yes checkbox
    page1.drawRectangle({ 
      x: 310, 
      y: employerRowY - 8, 
      width: 10, 
      height: 10, 
      borderColor: rgb(0, 0, 0), 
      borderWidth: 1 
    })
    page1.drawText("Yes", { x: 325, y: employerRowY, size: 10, font: helvetica })

    // No checkbox
    page1.drawRectangle({ 
      x: 350, 
      y: employerRowY - 8, 
      width: 10, 
      height: 10, 
      borderColor: rgb(0, 0, 0), 
      borderWidth: 1 
    })
    page1.drawText("No", { x: 365, y: employerRowY, size: 10, font: helvetica })

    // Mark checkbox depending on value
    if (app.isDivision) {
      // Mark YES
      page1.drawText("X", { x: 312, y: employerRowY - 7, size: 10, font: helveticaBold })
    } else {
      // Mark NO
      page1.drawText("X", { x: 352, y: employerRowY - 7, size: 10, font: helveticaBold })
    }


    // Parent Company
    page1.drawText("Parent Company:", { x: 380, y: employerRowY, size: 10, font: helveticaBold })
    page1.drawText(app.parentCompany || "", { x: 465, y: employerRowY, size: 10, font: helvetica })
    page1.drawLine({ start: { x: 460, y: employerRowY - 2 }, end: { x: 592, y: employerRowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })








// Employee Info Heading
const employeeY = employerRowY - 30
page1.drawText("Employee Information", { 
  x: 20, 
  y: employeeY, 
  size: 16, 
  font: helveticaBold 
})
page1.drawLine({ 
  start: { x: 20, y: employeeY - 3 }, 
  end: { x: 592, y: employeeY - 3 }, 
  thickness: 1, 
  color: rgb(0, 0, 0) 
})


// Row 1
let rowY = employeeY - 20
page1.drawText("Last Name:", { x: 20, y: rowY, size: 10, font: helveticaBold })
page1.drawText(app.lastName || "", { x: 75, y: rowY, size: 10, font: helvetica })
page1.drawLine({ start: { x: 75, y: rowY - 2 }, end: { x: 140, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

page1.drawText("First Name:", { x: 140, y: rowY, size: 10, font: helveticaBold })
page1.drawText(app.firstName || "", { x: 200, y: rowY, size: 10, font: helvetica })
page1.drawLine({ start: { x: 200, y: rowY - 2 }, end: { x: 250, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

page1.drawText("Middle Name:", { x: 250, y: rowY, size: 10, font: helveticaBold })
page1.drawText(app.middleName || "", { x: 320, y: rowY, size: 10, font: helvetica })
page1.drawLine({ start: { x: 320, y: rowY - 2 }, end: { x: 350, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

page1.drawText("Job Title:", { x: 350, y: rowY, size: 10, font: helveticaBold })
page1.drawText(app.jobTitle || "", { x: 400, y: rowY, size: 10, font: helvetica })
page1.drawLine({ start: { x: 400, y: rowY - 2 }, end: { x: 500, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

//needs to be hours per week
page1.drawText("Hrs/week:", { x: 505, y: rowY, size: 10, font: helveticaBold })
page1.drawText(app.hrsPerWeek || "", { x: 560, y: rowY, size: 10, font: helvetica })
page1.drawLine({ start: { x: 560, y: rowY - 2 }, end: { x: 592, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })



// Row 2
rowY -= 20
page1.drawText("Phone Number:", { x: 20, y: rowY, size: 10, font: helveticaBold })
page1.drawText(app.phoneNumber || "", { x: 95, y: rowY, size: 10, font: helvetica })
page1.drawLine({ start: { x: 95, y: rowY - 2 }, end: { x: 240, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })

page1.drawText("Email:", { x: 250, y: rowY, size: 10, font: helveticaBold })
page1.drawText(app.email || "", { x: 290, y: rowY, size: 10, font: helvetica })
page1.drawLine({ start: { x: 290, y: rowY - 2 }, end: { x: 592, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })







// Row 3 - Address
rowY -= 20

// Label
page1.drawText("Address:", { x: 20, y: rowY, size: 10, font: helveticaBold })

// Full Address on one line
const fullAddress = `${app.streetAddress || ""}, ${app.city || ""}, ${app.state || ""} ${app.zipCode || ""}`
page1.drawText(fullAddress, { x: 70, y: rowY, size: 10, font: helvetica })

// Underline
page1.drawLine({ start: { x: 70, y: rowY - 2 }, end: { x: 592, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) })









// Enrolling Heading
let headingY = employeeY - 90
page1.drawText("Enrolling Employee / Spouse / Domestic Partner* / Dependents", { 
  x: 20, 
  y: headingY, 
  size: 16, 
  font: helveticaBold 
})
page1.drawLine({ 
  start: { x: 20, y: headingY - 3 }, 
  end: { x: 592, y: headingY - 3 }, 
  thickness: 1, 
  color: rgb(0, 0, 0) 
})


// ---------------- Employee + Dependents Table ----------------
const tableX = 20
let tableY = employeeY - 130 // spacing under Employee Info
const rowHeight = 28 // taller row for header to fit two lines

// Define headers
const headers = [
  "", // blank column
  "Name (Last, First, Middle)",
  "Social Security # (User use only)",
  "Date of Birth (MM/DD/YYYY)",
  "Age",
  "Gender",
  "Weight",
  "Height"
]

// Define column widths (fit into 592 exactly)
const colWidths = [120, 100, 90, 90, 40, 40, 40, 52] // total = 592

// ---- Draw Header Row ----
let headerX = tableX
headers.forEach((header, i) => {
  page1.drawRectangle({
    x: headerX,
    y: tableY,
    width: colWidths[i],
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1
  })

  // Split at "(" so anything inside parentheses goes on next line
  const parts = header.split("(")
  const mainText = parts[0].trim()
  const subText = parts[1] ? "(" + parts[1] : ""

  // Draw main text
  page1.drawText(mainText, {
    x: headerX + 2,
    y: tableY + rowHeight - 12, // top line
    size: 8,
    font: helveticaBold
  })

  // Draw sub text if exists
  if (subText) {
    page1.drawText(subText, {
      x: headerX + 2,
      y: tableY + 6, // lower line
      size: 7,
      font: helvetica
    })
  }

  headerX += colWidths[i]
})

// ---- Rows (Employee, Spouse/Domestic Partner*, Dependents) ----
const rowLabels = [
  "Employee",
  "Spouse/Domestic Partner*"
]

rowLabels.forEach((label, rowIndex) => {
  const y = tableY - (rowHeight * (rowIndex + 1))
  let cellX = tableX

  colWidths.forEach((w, colIndex) => {
    // Draw cell outline
    page1.drawRectangle({
      x: cellX,
      y: y,
      width: w,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })

    // Fill first column (row label)
    if (colIndex === 0) {
      page1.drawText(label, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
    }

    // Fill Employee row
    if (rowIndex === 0) {
      switch (colIndex) {
        case 1:
          page1.drawText(`${app.lastName}, ${app.firstName} ${app.middleName}`, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 2:
          page1.drawText(app.socialSecurityNumber, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 3:
          page1.drawText(app.dateOfBirth, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 4:
          page1.drawText(app.age, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 5:
          page1.drawText(app.gender, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 6:
          page1.drawText(app.weight, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 7:
          page1.drawText(app.height, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
      }
    }

    // Fill Spouse row
    if (rowIndex === 1) {
      switch (colIndex) {
        case 1:
          page1.drawText(`${app.spouseLastName || ""}, ${app.spouseFirstName || ""} ${app.spouseMiddleName || ""}`, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 2:
          page1.drawText(app.spouseSocialSecurityNumber || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 3:
          // Format spouseDateOfBirth as MM/DD/YYYY
          let formattedSpouseDOB = "";
          if (app.spouseDateOfBirth) {
            const d = new Date(app.spouseDateOfBirth);
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(d.getUTCDate()).padStart(2, '0');
            const yyyy = d.getUTCFullYear();
            formattedSpouseDOB = `${mm}/${dd}/${yyyy}`;
          }
          page1.drawText(formattedSpouseDOB, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 4:
          page1.drawText(app.spouseAge || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 5:
          page1.drawText(app.spouseGender || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 6:
          page1.drawText(app.spouseWeight || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
        case 7:
          page1.drawText(app.spouseHeight || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
          break
      }
    }

    cellX += w
  })
})

// ---- Dependents ----
app.dependents.forEach((dep, i) => {
  const y = tableY - rowHeight * (i + 3) // start after employee & spouse rows
  let cellX = tableX

  colWidths.forEach((w, colIndex) => {
    // Draw cell outline
    page1.drawRectangle({
      x: cellX,
      y,
      width: w,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })

    // First column: Dependent label
    if (colIndex === 0) {
      page1.drawText("Dependent", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
    }

    // Dependent data
    switch (colIndex) {
      case 1:
        page1.drawText(`${dep.lastName}, ${dep.firstName}`, { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
        break
      case 2:
        page1.drawText(dep.socialSecurityNumber || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
        break
      case 3:
        page1.drawText(dep.dateOfBirth || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
        break
      case 4:
        page1.drawText(dep.age || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
        break
      case 5:
        page1.drawText(dep.gender || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
        break
      case 6:
        page1.drawText(dep.weight || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
        break
      case 7:
        page1.drawText(dep.height || "", { x: cellX + 2, y: y + 8, size: 8, font: helvetica })
        break
    }

    cellX += w
  })
})















    // --- Page 2: Signature only ---
    const page2 = pdfDoc.addPage([612, 792])
    const { height: h2 } = page2.getSize()








        

// ---------------- Health Plan Options Section ----------------

// Heading
let healthY = 750

page2.drawText("Health Plan Options", {
  x: 20,
  y: healthY,
  size: 16,
  font: helveticaBold
})

page2.drawLine({
  start: { x: 20, y: healthY - 3 },
  end: { x: 592, y: healthY - 3 },
  thickness: 1,
  color: rgb(0, 0, 0)
})

// Description text
const descY = healthY - 20
page2.drawText(
  "Please select the plan you would like to enroll in. For more information on the plans listed below, please contact your insurance agent or broker to obtain a copy of the Plan Highlights.",
  { x: 20, y: descY, size: 10, font: helvetica }
)

// Table setup
const planTableY = descY - 30
const planTableX = 20
const planRowHeight = 20

// Plan headers
const planHeaders = ["Select", "Plan Name / Type"]
const planColWidths = [50, 522] 

// Draw header row
let planHeaderX = planTableX
planHeaders.forEach((header, i) => {
  page2.drawRectangle({
    x: planHeaderX,
    y: planTableY,
    width: planColWidths[i],
    height: planRowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1
  })

  page2.drawText(header, {
    x: planHeaderX + 2,
    y: planTableY + 6,
    size: 9,
    font: helveticaBold
  })

  planHeaderX += planColWidths[i]
})

// Plan rows (display name vs db value)
const planRows = [
  { name: "Plan 1", value: "plan1" },
  { name: "Plan 2", value: "plan2" }
]

// Use `app.healthPlan` from DB to check the right one
planRows.forEach((row, rowIndex) => {
  const y = planTableY - planRowHeight * (rowIndex + 1)
  let cellX = planTableX

  // Checkbox cell
  page2.drawRectangle({
    x: cellX,
    y,
    width: planColWidths[0],
    height: planRowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1
  })
  page2.drawRectangle({ 
    x: cellX + 15, 
    y: y + 5, 
    width: 10, 
    height: 10, 
    borderColor: rgb(0, 0, 0), 
    borderWidth: 1 
  })

  // ✅ Draw checkmark if this plan is selected in DB
  if (app.healthPlan === row.value) {
    page2.drawLine({
      start: { x: cellX + 15, y: y + 10 },
      end: { x: cellX + 20, y: y + 5 },
      thickness: 1.5,
      color: rgb(0, 0, 0)
    })
    page2.drawLine({
      start: { x: cellX + 20, y: y + 5 },
      end: { x: cellX + 28, y: y + 15 },
      thickness: 1.5,
      color: rgb(0, 0, 0)
    })
  }

  // Plan name cell
  cellX += planColWidths[0]
  page2.drawRectangle({
    x: cellX,
    y,
    width: planColWidths[1],
    height: planRowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1
  })
  page2.drawText(row.name, { 
    x: cellX + 5, 
    y: y + 6, 
    size: 9, 
    font: helvetica 
  })
})











// ---------------- Vision and Dental Plan Options Section ----------------

// Start below Health section (adjust spacing as needed)
let visionDentalY = planTableY - (planRowHeight * (planRows.length + 3))

// Heading
page2.drawText("Vision and Dental Plan Options", {
  x: 20,
  y: visionDentalY,
  size: 16,
  font: helveticaBold
})

page2.drawLine({
  start: { x: 20, y: visionDentalY - 3 },
  end: { x: 592, y: visionDentalY - 3 },
  thickness: 1,
  color: rgb(0, 0, 0)
})

// Description text
const visionDescY = visionDentalY - 20
page2.drawText(
  "Do you like to enroll in the vision/dental plan? For more information on the vision/dental plan listed below, please contact your insurance agent or broker.",
  { x: 20, y: visionDescY, size: 10, font: helvetica }
)

// Table setup
const visionTableY = visionDescY - 30
const visionTableX = 20
const visionRowHeight = 20

// Plan headers
const visionHeaders = ["Select", "Plan Name / Type"]
const visionColWidths = [50, 522] 

// Draw header row
let visionHeaderX = visionTableX
visionHeaders.forEach((header, i) => {
  page2.drawRectangle({
    x: visionHeaderX,
    y: visionTableY,
    width: visionColWidths[i],
    height: visionRowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1
  })
  page2.drawText(header, {
    x: visionHeaderX + 2,
    y: visionTableY + 6,
    size: 9,
    font: helveticaBold
  })
  visionHeaderX += visionColWidths[i]
})

// Plan rows (update values to vision/dental plans)
const visionRows = [
  { name: "Vision & Dental Plan", value: "vd1" },
]

// Use `app.visionDentalPlan` from DB
visionRows.forEach((row, rowIndex) => {
  const y = visionTableY - visionRowHeight * (rowIndex + 1)
  let cellX = visionTableX

  // Checkbox cell
  page2.drawRectangle({ x: cellX, y, width: visionColWidths[0], height: visionRowHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 })
  page2.drawRectangle({ x: cellX + 15, y: y + 5, width: 10, height: 10, borderColor: rgb(0, 0, 0), borderWidth: 1 })

  // ✅ Draw checkmark if selected
  if (app.visionAndDentalPlan === true) {
    page2.drawLine({ start: { x: cellX + 15, y: y + 10 }, end: { x: cellX + 20, y: y + 5 }, thickness: 1.5, color: rgb(0, 0, 0) })
    page2.drawLine({ start: { x: cellX + 20, y: y + 5 }, end: { x: cellX + 28, y: y + 15 }, thickness: 1.5, color: rgb(0, 0, 0) })
  }

  // Plan name cell
  cellX += visionColWidths[0]
  page2.drawRectangle({ x: cellX, y, width: visionColWidths[1], height: visionRowHeight, borderColor: rgb(0, 0, 0), borderWidth: 1 })
  page2.drawText(row.name, { x: cellX + 5, y: y + 6, size: 9, font: helvetica })
})













    
    // ---------------- Ancillary Plans Section ----------------
if (app.ancillaryPlans && app.ancillaryPlans.length > 0) {
  healthY -= 280
  page2.drawText("Ancillary Plans", { 
    x: 20, 
    y: healthY, 
    size: 16, 
    font: helveticaBold 
  })
  page2.drawLine({ 
    start: { x: 20, y: healthY - 3 }, 
    end: { x: 592, y: healthY - 3 }, 
    thickness: 1, 
    color: rgb(0, 0, 0) 
  })

  healthY -= 20
  app.ancillaryPlans.forEach((plan, idx) => {
    page2.drawText(`${idx + 1}. ${plan.planName || ""} - ${plan.product || ""} - $${plan.price ?? ""}`, {
      x: 30,
      y: healthY,
      size: 12,
      font: helvetica
    })
    healthY -= 15
  })
}






// ---------------- Total Section ----------------
const pageWidth = 612; // standard page width
const rightMargin = 20;
const totalX = pageWidth - rightMargin - 200; // shift total section to the right (200px width)

// Calculate total using explicit plan prices (NBBA Fee not included)
let total = 0
if (app.healthPlanPrice) total += Number(app.healthPlanPrice)
if (app.visionAndDentalPrice) total += Number(app.visionAndDentalPrice)
if (app.ancillaryPlans && app.ancillaryPlans.length > 0) {
  app.ancillaryPlans.forEach(plan => total += Number(plan.price) || 0)
}
const nbbaFee = 24.95

// Print line items on the right
healthY -= 175 // move up by 50px more (total 125px up from original)
page2.drawText("Total", { 
  x: totalX, 
  y: healthY, 
  size: 16, 
  font: helveticaBold 
})

healthY -= 20
page2.drawText(`Health Plan Price: $${app.healthPlanPrice ?? "0"}`, { x: totalX + 20, y: healthY, size: 12, font: helvetica })
healthY -= 15
page2.drawText(`Vision & Dental Plan Price: $${app.visionAndDentalPrice ?? "0"}`, { x: totalX + 20, y: healthY, size: 12, font: helvetica })

if (app.ancillaryPlans && app.ancillaryPlans.length > 0) {
  healthY -= 15
  page2.drawText("Ancillary Plans:", { x: totalX + 20, y: healthY, size: 12, font: helveticaBold })
  app.ancillaryPlans.forEach(plan => {
    healthY -= 15
    page2.drawText(`${plan.planName || ""}: $${plan.price ?? "0"}`, { x: totalX + 40, y: healthY, size: 12, font: helvetica })
  })
}



// Final total
healthY -= 25
page2.drawText(`Grand Total: $${total.toFixed(2)}`, { 
  x: totalX + 20, 
  y: healthY, 
  size: 14, 
  font: helveticaBold 
})



    
    






    // rowY -= 20
    // page2.drawText(`Health Plan: ${app.healthPlan}`, { x: 40, y: height - 540, size: 10 })
    // page2.drawText(`Dental Plan: ${app.dentalPlan || "N/A"}`, { x: 300, y: height - 540, size: 10 })
    // page2.drawText(`Vision Plan: ${app.visionPlan || "N/A"}`, { x: 40, y: height - 580, size: 10 })
    // page2.drawText(`Life/Ancillary: ${app.lifeAncillaryPlan || "N/A"}`, { x: 300, y: height - 580, size: 10 })


   // Coordinates and dimensions
const sigLabelX = 40
const sigLabelY = 50
const sigBoxX = sigLabelX + 150 // more space between label and box
const sigBoxY = 40              // align roughly with label
const sigWidth = 250
const sigHeight = 60            // taller box

// Draw the label text
page2.drawText("Employee Signature:", {
  x: sigLabelX,
  y: sigLabelY,
  size: 12,
  font: helveticaBold
})

// Draw the rectangle (box) for the signature
page2.drawRectangle({
  x: sigBoxX,
  y: sigBoxY,
  width: sigWidth,
  height: sigHeight,
  borderColor: rgb(0, 0, 0),
  borderWidth: 1,
  color: rgb(1, 1, 1) // white fill
})

// Embed the signature image inside the box
if (signatureDataUrl) {
  const pngBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer())
  const pngImage = await pdfDoc.embedPng(pngBytes)
  const pngDims = pngImage.scale(0.25)

  // Draw the signature image inside the box
  page2.drawImage(pngImage, {
    x: sigBoxX + 5, // padding from left
    y: sigBoxY + 5, // padding from bottom
    width: pngDims.width,
    height: pngDims.height
  })
}



    const pdfBytes = await pdfDoc.save()

    // Upload PDF
    const formData = new FormData()
    formData.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }))
    formData.append('applicationId', String(app.id))

    const authToken = useCookie('auth_token').value
    const res = await fetch('/api/applications/sign', {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()

    message.value = 'Application signed and PDF uploaded!'
    pdfDownloadUrl.value = data.pdfUrl
    pad.clear()
    app.pdfUrl = data.pdfUrl

  } catch (err: any) {
    console.error(err)
    error.value = 'Failed to submit application'
  }
}

// Format helper (safe for null/undefined)
const formatDate = (date: Date | string | null) => {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0] // keeps only YYYY-MM-DD
}

function downloadPdf() {
  if (!pdfDownloadUrl.value) return
  window.open(pdfDownloadUrl.value, '_blank')
}

function downloadExistingPdf(url: string) {
  window.open(url, '_blank')
}

function formatForDateInput(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  // Parse as UTC to avoid timezone offset issues
  const d = new Date(dateStr)
  const year = d.getUTCFullYear()
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = d.getUTCDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}


onMounted(async () => {
  try {
    const authToken = useCookie('auth_token').value

    const res: InsuranceApplication[] = await $fetch('/api/applications/my', {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    

    applications.value = res.map((app, index) => {

      const normalized = {
        ...app,
        dateOfBirth: app.dateOfBirth
          ? new Date(app.dateOfBirth).toISOString().split('T')[0]
          : '',
        reasons: Array.isArray(app.reasons)
          ? app.reasons
          : app.reasons
            ? app.reasons.split(',').map(r => r.trim())
            : []
      }

      return normalized
    }) as any

  } catch (err: any) {
    console.error('Error fetching applications:', err)
  }
})



</script>
