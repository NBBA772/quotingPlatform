<template>
  <div class="mx-auto p-6 bg-white dark:bg-[#2d352d] rounded-xl shadow-md space-y-6">
    <div
      v-for="auth in paymentAuthorizations"
      :key="auth.id"
      class="border border-gray-200 dark:border-gray-700 p-5 rounded-xl"
    >
      <!-- Already signed -->
      <div v-if="auth.pdfUrl">
        <p class="text-green-600 dark:text-green-400 font-medium">
          This payment authorization has already been signed.
        </p>
        <button
          @click="downloadExistingPdf(auth.pdfUrl)"
          class="mt-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
        >
          Download Signed PDF
        </button>
      </div>

      <!-- Authorization Form -->
      <form v-else @submit.prevent="submitForm(auth)" class="space-y-5">
       

      
      

        <!-- Contact Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              v-model="auth.fullName"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              v-model="auth.email"
              type="email"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              required
            />
          </div>
        </div>

                  <!-- Billing Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Billing Address</label>
            <input
              v-model="auth.billingAddress"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              placeholder="123 Main St"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">City</label>
            <input
              v-model="auth.city"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              placeholder="City"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">State</label>
            <input
              v-model="auth.state"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              placeholder="State"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
            <input
              v-model="auth.zip"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              placeholder="Zip"
              required
            />
          </div>
        </div>

        <!-- Plan Selection -->
<div>
  <label class="block text-gray-700 dark:text-gray-300 mb-1">Select Plan</label>
  <select
    v-model="auth.plan"
    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
    required
  >
    <option value="" disabled>Select a plan</option>
    <option value="Single Member">Single Member | $99.99 Once & $24.99/month</option>
    <option value="2-5 Employees">2-5 Employees | $299.99 Once & $24.99/month</option>
    <option value="6-10 Employees">6-10 Employees | $599.99 Once & $24.99/month</option>
    <option value="11+ Employees">11+ Employees | $999.99 Once & $24.99/month</option>
  </select>
</div>





          <!-- Bank Draft Info (always shown above card info) -->
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
              <input
                v-model="auth.bankName"
                type="text"
                placeholder="Bank Name"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-1">Routing Number</label>
              <input
                v-model="auth.routingNumber"
                type="text"
                maxlength="9"
                placeholder="Routing Number"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
              <input
                v-model="auth.accountNumber"
                type="text"
                maxlength="17"
                placeholder="Account Number"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              />
            </div>
          </div>
     


    <div v-if="employees.length" class="mb-8">
  <h2 class="text-xl font-bold mb-4">Employees & Insurance Applications</h2>
  <div
    v-for="emp in employees"
    :key="emp.id"
    class="mb-6 border p-4 rounded"
  >
    <div class="font-semibold mb-2">
      {{ emp.firstName }} {{ emp.lastName }}
    </div>
    <div v-if="emp.user && emp.user.insuranceApplications && emp.user.insuranceApplications.length">
      <div
        v-for="app in emp.user.insuranceApplications"
        :key="app.id"
        class="mb-2 pl-4 border-l"
      >
        <p><strong>Insurance Plan:</strong> {{ app.healthPlan }} - ${{ app.healthPlanPrice }}</p>
        <p><strong>Vision & Dental Plan:</strong> {{ app.visionAndDentalPlan ? 'Yes' : 'No' }} - ${{ app.visionAndDentalPrice }}</p>
        <div>
          <strong>Ancillary Plans:</strong>
          <ul>
            <li v-for="plan in app.ancillaryPlans" :key="plan.id">
              {{ plan.planName }} - {{ plan.product }} -{{ plan.price }}
            </li>
            <li v-if="!app.ancillaryPlans.length">None</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-500">No insurance applications.</div>
  </div>

  <!-- Total Section -->
<div class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
  <h3 class="font-bold text-lg mb-2">Totals</h3>
  <p><strong>Total Employees:</strong> {{ employees.length }}</p>

  <p>
    <strong>Health Plan Total:</strong>
    <span class="font-bold">${{ healthPlanTotalAmount.toFixed(2) }}</span>
  </p>
  <p>
    <strong>Vision & Dental Plan Total:</strong>
    <span class="font-bold">${{ visionDentalTotalAmount.toFixed(2) }}</span>
  </p>

  <p>
  <strong>Ancillary Plans:</strong> 
</p>
<ul v-if="allAncillaryPlans.length" class="ml-4 list-disc text-sm">
  <li v-for="plan in allAncillaryPlans" :key="plan.id">
    {{ plan.planName }} - {{ plan.product }} - ${{ plan.price }}
  </li>
</ul>

<p>
  <strong>One-Time Plan Fee(s):</strong>
  <span v-if="totalOneTimeFee > 0 && !insuranceApplications[0].waiveOneTimeFee">
    ${{ totalOneTimeFee.toFixed(2) }}
    <span class="text-gray-500 text-xs">(from selected plan{{ paymentAuthorizations.length > 1 ? 's' : '' }})</span>
  </span>
  <span v-else>
    $0.00
  </span>
</p>

<p class="mt-2">
  <strong>Grand Total:</strong>
  <span class="font-bold">
    ${{
      healthPlanTotalAmount +
      visionDentalTotalAmount +
      ancillaryTotals.totalPrice +
      totalOneTimeFee
    }}
    <span class="font-normal text-base"> + ${{ selectedMonthlyFee }} per month</span>
  </span>
</p>

</div>
</div>
          
        <!-- Signature -->
        <div>
          <label class="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Electronic Signature
          </label>
          <div class="signature-container mt-4">
            <SignaturePad
              class="w-full h-40 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#3a3a3a]"
              :ref="el => { if (el) signaturePads[auth.id] = el.signaturePad }"
            />
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-2 italic">*Sign Here</p>
          </div>
        </div>

        <div class="flex items-center mt-3">
          <input type="checkbox" v-model="consent[auth.id]" class="mr-2" required />
          <label class="text-gray-700 dark:text-gray-300 text-sm">
            I consent to electronic signature and authorize this payment.
          </label>
        </div>

        <button
          type="submit"
          :disabled="!consent[auth.id]"
          class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Authorize Payment
        </button>
      </form>
    </div>

    <p v-if="message" class="text-green-600 mt-2">{{ message }}</p>
    <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// Totals for healthPlanPrice and visionAndDentalPrice from insurance applications
const healthPlanTotalAmount = computed(() => {
  let total = 0;
  let count = 0;
  employees.value.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (typeof app.healthPlanPrice === 'number' && !isNaN(app.healthPlanPrice)) {
          total += app.healthPlanPrice;
          count++;
        }
      });
    }
  });
  return total;
});

const healthPlanTotalCount = computed(() => {
  let count = 0;
  employees.value.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (typeof app.healthPlanPrice === 'number' && !isNaN(app.healthPlanPrice)) {
          count++;
        }
      });
    }
  });
  return count;
});

const visionDentalTotalAmount = computed(() => {
  let total = 0;
  let count = 0;
  employees.value.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (typeof app.visionAndDentalPrice === 'number' && !isNaN(app.visionAndDentalPrice)) {
          total += app.visionAndDentalPrice;
          count++;
        }
      });
    }
  });
  return total;
});

const visionDentalTotalCount = computed(() => {
  let count = 0;
  employees.value.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (typeof app.visionAndDentalPrice === 'number' && !isNaN(app.visionAndDentalPrice)) {
          count++;
        }
      });
    }
  });
  return count;
});
import { ref, reactive, onMounted } from 'vue';
import SignaturePad from 'vue3-signature-pad';
import axios from 'axios';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';


const emit = defineEmits(["completed"])

interface PaymentAuthorization {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'ach' | 'paypal';
  description?: string;
  fullName: string;
  email: string;
  pdfUrl?: string;
  signatureImageUrl?: string;

  // Billing info
  cardNumber?: string;
  expiration?: string;      // MM/YY
  cvv?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
}

const planPrices = {
  "Single Member": { oneTime: 99.99, monthly: 24.99 },
  "2-5 Employees": { oneTime: 299.99, monthly: 24.99 },
  "6-10 Employees": { oneTime: 599.99, monthly: 24.99 },
  "11+ Employees": { oneTime: 999.99, monthly: 24.99 },
};



const selectedMonthlyFee = computed(() => {
  // Find the first selected plan in paymentAuthorizations
  const auth = paymentAuthorizations.value.find(a => a.plan && planPrices[a.plan])
  return auth ? planPrices[auth.plan].monthly : 24.95
})


const totalOneTimeFee = computed(() => {
  return paymentAuthorizations.value.reduce((sum, auth) => {
    if (auth.plan && planPrices[auth.plan] && insuranceApplications.value[0].waiveOneTimeFee !== true) {
      return sum + planPrices[auth.plan].oneTime
    }
    return sum
  }, 0)
})



const signaturePads = reactive<Record<number, any>>({});
const consent = reactive<Record<number, boolean>>({});
const paymentAuthorizations = ref<PaymentAuthorization[]>([]);
const message = ref('');
const error = ref('');

onMounted(async () => {
  // First, try to fetch existing payment authorizations
  try {
    const existingAuths = await $fetch('/api/payment-authorization/my');
    
    if (existingAuths && existingAuths.length > 0) {
      // Use existing payment authorizations if found
      paymentAuthorizations.value = existingAuths;
    } else {
      // Create new payment authorization if none exist
      const user = await useUser();
      paymentAuthorizations.value = [
        {
          id: 1,
          userId: user?.id || 5,
          amount: 150,
          currency: 'USD',
          paymentMethod: 'card',
          fullName: user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : 'John Doe',
          email: user?.email || 'john@example.com',
        },
      ];
    }
  } catch (err) {
    console.error('Failed to fetch existing payment authorizations:', err);
    // Fallback to creating new ones if fetch fails
    const user = await useUser();
    paymentAuthorizations.value = [
      {
        id: 1,
        userId: user?.id || 5,
        amount: 150,
        currency: 'USD',
        paymentMethod: 'card',
        fullName: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : 'John Doe',
        email: user?.email || 'john@example.com',
      },
    ];
  }
});

watch(paymentAuthorizations, (auths) => {
  auths.forEach((auth) => {
    if (auth.plan && planPrices[auth.plan]) {
      auth.amount = planPrices[auth.plan].oneTime; // sets one-time amount
      auth.monthlyAmount = planPrices[auth.plan].monthly; // optional, for recurring
    }
  });
}, { deep: true });


const visionDentalCost = 50

const planCounts = computed(() => {
  let plan1 = 0
  let plan2 = 0
  let visionDental = 0
  employees.value.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (app.healthPlan === 'plan1') plan1++
        if (app.healthPlan === 'plan2') plan2++
        if (app.visionAndDentalPlan) visionDental++
      })
    }
  })
  return { plan1, plan2, visionDental }
})

const plan1Cost = 300
const plan2Cost = 756

const ancillaryTotals = computed(() => {
  let count = 0
  let totalPrice = 0
  employees.value.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (app.ancillaryPlans && app.ancillaryPlans.length) {
          app.ancillaryPlans.forEach(plan => {
            count++
            // Make sure plan.price is a number
            const price = Number(plan.price)
            if (!isNaN(price)) totalPrice += price
          })
        }
      })
    }
  })
  return { count, totalPrice }
})



const allAncillaryPlans = computed(() => {
  const plans = []
  employees.value.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (app.ancillaryPlans && app.ancillaryPlans.length) {
          app.ancillaryPlans.forEach(plan => {
            plans.push(plan)
          })
        }
      })
    }
  })
  return plans
})


const employees = ref([])






const user = ref(null)
const insuranceApplications = ref([]);

onMounted(async () => {
  user.value = await useUser();
  const companyId = user.value?.companyId;

  try {
    employees.value = await $fetch('/api/company/employees-applications', {
      method: 'POST',
      body: { companyId }
    });

    // If logged-in user is not already in employees, add them with insurance info
    if (
      user.value &&
      !employees.value.some(emp => emp.user && emp.user.id === user.value.id)
    ) {
      // Fetch insurance applications for the logged-in user
      const apps = await $fetch('/api/applications/my', {
        method: 'POST',
        body: { userId: user.value.id }
      });
      insuranceApplications.value = apps; // <-- store here!
      employees.value.push({
        id: user.value.id,
        firstName: user.value.firstName,
        lastName: user.value.lastName,
        user: {
          ...user.value,
          insuranceApplications: apps
        }
      });
    } else if (user.value) {
      // If already in employees, still set insuranceApplications for template use
      const emp = employees.value.find(emp => emp.user && emp.user.id === user.value.id);
      insuranceApplications.value = emp?.user?.insuranceApplications || [];
    }
  } catch (err) {
    console.error('Failed to fetch employees:', err);
  }
});



const getEmployeeApplications = (employees) => {
  return employees.map(emp => {
    const user = emp.user
    if (!user || !user.insuranceApplications) return null
    return {
      employee: emp,
      applications: user.insuranceApplications.map(app => ({
        ...app,
        visionAndDental: app.visionAndDentalPlan ? 'Yes' : 'No',
        ancillaryPlans: app.ancillaryPlans || []
      }))
    }
  }).filter(Boolean)
}




let company = null

async function generatePdf(auth, signatureDataUrl, employees, planCounts, ancillaryTotals, allAncillaryPlans, totalOneTimeFee, selectedMonthlyFee) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const companyName = 'NBBA Local'; // replace with env var if needed
    // --- Embed logo ---
    const logoUrl = '/img/logo.png'
    const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer())
    const logoImage = await pdfDoc.embedPng(logoBytes)
    const logoDims = logoImage.scale(0.45)

    

    page.drawImage(logoImage, { x: 50, y: height - 90, width: logoDims.width, height: logoDims.height })

  // Title
  page.drawText('Recurring Payment Authorization Form', {
    x: 160,
    y: height - 80,
    size: 18,
    font: fontBold,
    color: rgb(0, 0.2, 0.6),
  });

  // Intro Paragraph
  const introText = `
I, ${auth.fullName}, authorize ${companyName} to charge my account as indicated below for payment of services or products as described. 
I understand that this authorization is for a recurring subscription and will remain in effect until I cancel it in writing.`;

  page.drawText(introText.trim(), {
    x: 50,
    y: height - 130,
    size: 12,
    font,
    lineHeight: 14,
    maxWidth: 480,
  });
let y = height - 210; // starting Y position





// Common settings
let rowY = y; // current Y position
const startX = 50;
const underlineWidthRow1and2 = 250; // for longer names/company
const underlineWidthRow3 = 100; // for amount/date/month blanks

// ------------------ Row 1 ------------------
const label1Row1 = "I, ";
const valueRow1 = auth.fullName || "";
const label2Row1 = " (Cardholder), authorize";

page.drawText(label1Row1, { x: startX, y: rowY, size: 12, font: fontBold });
const valueXRow1 = startX + font.widthOfTextAtSize(label1Row1, 12);
page.drawText(valueRow1, { x: valueXRow1, y: rowY, size: 12, font });
page.drawLine({
  start: { x: valueXRow1, y: rowY - 2 },
  end: { x: valueXRow1 + underlineWidthRow1and2, y: rowY - 2 },
  thickness: 1,
  color: rgb(0, 0, 0),
});
const label2XRow1 = valueXRow1 + underlineWidthRow1and2 + 5;
page.drawText(label2Row1, { x: label2XRow1, y: rowY, size: 12, font });

// ------------------ Row 2 ------------------
rowY -= 30;

const valueRow2 = companyName;
const label2Row2 = " (Merchant) to charge my bank account for";

page.drawText("", { x: startX, y: rowY, size: 12, font: fontBold }); // empty label
const valueXRow2 = startX; // no label offset
page.drawText(valueRow2, { x: valueXRow2, y: rowY, size: 12, font });
page.drawLine({
  start: { x: valueXRow2, y: rowY - 2 },
  end: { x: valueXRow2 + underlineWidthRow1and2, y: rowY - 2 },
  thickness: 1,
  color: rgb(0, 0, 0),
});
const label2XRow2 = valueXRow2 + underlineWidthRow1and2 + 5;
page.drawText(label2Row2, { x: label2XRow2, y: rowY, size: 12, font });

// ------------------ Row 3 (One-time + Recurring payment) ------------------
rowY -= 30; // move down from Row 2

const underlineWidthAmount = 150; // wider underline for amounts
const underlineWidthDate = 100;   // underline for date/month

let xPos = startX;

// --- One-time payment ---
const labelOneTime = "a one-time payment of ";
const valueOneTime =
  insuranceApplications.value.length &&
  insuranceApplications.value[0].waiveOneTimeFee
    ? "$0.00 (waived)"
    : auth.amount && auth.currency
      ? `$${auth.amount.toFixed(2)}`
      : "";

const labelOneTimeEnd = " and charge my credit/debit card for";

// Label text
page.drawText(labelOneTime, { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize(labelOneTime, 12);

// Amount underline
page.drawText(valueOneTime, { x: xPos, y: rowY, size: 12, font });
page.drawLine({
  start: { x: xPos, y: rowY - 2 },
  end: { x: xPos + underlineWidthAmount, y: rowY - 2 },
  thickness: 1,
  color: rgb(0, 0, 0),
});
xPos += underlineWidthAmount;

// End label

const labelRecurring1 = "$";
const valueRecurring = '24.95';
const labelRecurring2 = " on the ";
const valueDate = new Date().toLocaleDateString();
const labelRecurring3 = " of each ";
const valueMonth = "month";

// $Amount
page.drawText(labelRecurring1, { x: xPos, y: rowY, size: 12, font: fontBold });
xPos += font.widthOfTextAtSize(labelRecurring1, 12);
page.drawText(valueRecurring, { x: xPos, y: rowY, size: 12, font });
page.drawLine({
  start: { x: xPos, y: rowY - 2 },
  end: { x: xPos + underlineWidthAmount, y: rowY - 2 },
  thickness: 1,
  color: rgb(0, 0, 0),
});
xPos += underlineWidthAmount;

// " on the "
page.drawText(labelRecurring2, { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize(labelRecurring2, 12);

// Date underline
page.drawText(valueDate, { x: xPos, y: rowY, size: 12, font });
page.drawLine({
  start: { x: xPos, y: rowY - 2 },
  end: { x: xPos + underlineWidthDate, y: rowY - 2 },
  thickness: 1,
  color: rgb(0, 0, 0),
});
xPos += underlineWidthDate;

// " of each "
page.drawText(labelRecurring3, { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize(labelRecurring3, 12);

// Month underline
page.drawText(valueMonth, { x: xPos, y: rowY, size: 12, font });
page.drawLine({
  start: { x: xPos, y: rowY - 2 },
  end: { x: xPos + underlineWidthDate, y: rowY - 2 },
  thickness: 1,
  color: rgb(0, 0, 0),
});

// ------------------ Row 4: Billing Information ------------------
rowY -= 40;
xPos = startX;

// Heading
page.drawText("Billing Information", { x: startX, y: rowY, size: 14, font: fontBold });

// Move down for actual fields
rowY -= 25;
xPos = startX;

// Billing Address
page.drawText("Billing Address: ", { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize("Billing Address: ", 12);
page.drawText(auth.billingAddress || "", { x: xPos, y: rowY, size: 12, font });
page.drawLine({ start: { x: xPos, y: rowY - 2 }, end: { x: xPos + 300, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) });

// City / State / Zip
rowY -= 30;
xPos = startX;

page.drawText("City: ", { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize("City: ", 12);
page.drawText(auth.city || "", { x: xPos, y: rowY, size: 12, font });
page.drawLine({ start: { x: xPos, y: rowY - 2 }, end: { x: xPos + 100, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) });
xPos += 100;

page.drawText(" State: ", { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize(" State: ", 12);
page.drawText(auth.state || "", { x: xPos, y: rowY, size: 12, font });
page.drawLine({ start: { x: xPos, y: rowY - 2 }, end: { x: xPos + 50, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) });
xPos += 50;

page.drawText(" Zip: ", { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize(" Zip: ", 12);
page.drawText(auth.zip || "", { x: xPos, y: rowY, size: 12, font });
page.drawLine({ start: { x: xPos, y: rowY - 2 }, end: { x: xPos + 70, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) });

// ------------------ Row 5: Bank Draft Information ------------------
rowY -= 40;
xPos = startX;

// Heading
page.drawText("Bank Draft Information", { x: startX, y: rowY, size: 14, font: fontBold });
rowY -= 25; // spacing below heading
xPos = startX;

// Bank Name
page.drawText("Bank Name: ", { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize("Bank Name: ", 12);
page.drawText(auth.bankName || "", { x: xPos, y: rowY, size: 12, font });
page.drawLine({ start: { x: xPos, y: rowY - 2 }, end: { x: xPos + 200, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) });

// Routing Number
xPos = startX;
rowY -= 25;
page.drawText("Routing Number: ", { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize("Routing Number: ", 12);
page.drawText(auth.routingNumber || "", { x: xPos, y: rowY, size: 12, font });
page.drawLine({ start: { x: xPos, y: rowY - 2 }, end: { x: xPos + 200, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) });

// Account Number
xPos = startX;
rowY -= 25;
page.drawText("Account Number: ", { x: xPos, y: rowY, size: 12, font });
xPos += font.widthOfTextAtSize("Account Number: ", 12);
page.drawText(auth.accountNumber || "", { x: xPos, y: rowY, size: 12, font });
page.drawLine({ start: { x: xPos, y: rowY - 2 }, end: { x: xPos + 200, y: rowY - 2 }, thickness: 1, color: rgb(0, 0, 0) });




  // Legal Statement
  const legalText = `
I authorize ${companyName} to make recurring charges to my account as indicated above for the amount stated. 
I understand that I may cancel this authorization at any time by providing written notice prior to the next scheduled payment. 
I confirm that I am an authorized user of this account and that I will not dispute these payments with my bank so long as the transactions correspond to the terms indicated in this agreement.`;

  page.drawText(legalText.trim(), {
    x: 50,
    y: y - 300,
    size: 11,
    font,
    lineHeight: 14,
    maxWidth: 480,
  });




// --- End of page 1 content ---

// Create page 2
const page2 = pdfDoc.addPage([595, 842]); // A4
const { height: height2 } = page2.getSize();
let rowY2 = height2 - 60;
const startX2 = 50;

// --- Employees & Insurance Applications Section ---
page2.drawText('Employees & Insurance Applications:', {
  x: startX2,
  y: rowY2,
  size: 13,
  font: fontBold,
  color: rgb(0, 0.2, 0.6),
});
rowY2 -= 18;

// Table header
const col1 = startX2 + 10;
const col2 = col1 + 160;
const col3 = col2 + 120;
const col4 = col3 + 120;

page2.drawText('Name', { x: col1, y: rowY2, size: 11, font: fontBold });
page2.drawText('Plan', { x: col2, y: rowY2, size: 11, font: fontBold });
page2.drawText('Vision & Dental', { x: col3, y: rowY2, size: 11, font: fontBold });
page2.drawText('Ancillary Plans', { x: col4, y: rowY2, size: 11, font: fontBold });
rowY2 -= 13;

// Table rows
employees.forEach(emp => {
  const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.user?.email || '';
  let maxLines = 1;
  let rowStartY = rowY2;
  if (emp.user && emp.user.insuranceApplications && emp.user.insuranceApplications.length) {
    // Calculate max lines needed for this employee
    emp.user.insuranceApplications.forEach(app => {
      const ancillaryCount = (app.ancillaryPlans && app.ancillaryPlans.length) ? app.ancillaryPlans.length : 1;
      if (ancillaryCount > maxLines) maxLines = ancillaryCount;
    });
    // Draw all columns for each line, but only fill the first line with name/plan/vision
    let lineIdx = 0;
    emp.user.insuranceApplications.forEach(app => {
      const ancillaryCount = (app.ancillaryPlans && app.ancillaryPlans.length) ? app.ancillaryPlans.length : 1;
      for (let i = 0; i < ancillaryCount; i++) {
        const y = rowStartY - (lineIdx * 12);
        if (i === 0) {
          page2.drawText(name, { x: col1, y, size: 10, font });
          page2.drawText(app.healthPlan || 'N/A', { x: col2, y, size: 10, font });
          page2.drawText(app.visionAndDentalPlan ? 'Yes' : 'No', { x: col3, y, size: 10, font });
        }
        // Ancillary plan for this line
        if (app.ancillaryPlans && app.ancillaryPlans.length) {
          const plan = app.ancillaryPlans[i];
          if (plan) {
            page2.drawText(`${plan.planName || ''} - ${plan.product || ''} - $${plan.price || ''}`, { x: col4, y, size: 10, font });
          }
        } else if (i === 0) {
          page2.drawText('None', { x: col4, y, size: 10, font });
        }
        lineIdx++;
      }
    });
    rowY2 = rowStartY - (maxLines * 12) - 8; // Add 8px extra space after each employee
  } else {
    page2.drawText(name, { x: col1, y: rowY2, size: 10, font });
    page2.drawText('No insurance applications.', { x: col2, y: rowY2, size: 10, font });
    rowY2 -= 12 + 8; // Add 8px extra space after each employee
  }
});



rowY2 -= 30;
page2.drawText('Totals:', {
  x: startX2,
  y: rowY2,
  size: 13,
  font: fontBold,
  color: rgb(0, 0.2, 0.6),
});
rowY2 -= 18;

page2.drawText(`Total Employees: ${employees.length}`, { x: startX2 + 10, y: rowY2, size: 11, font }); rowY2 -= 13;
  // Calculate totals from insurance applications
  let plan1Total = 0, plan2Total = 0, visionDentalTotal = 0;
  let plan1Unit = 0, plan2Unit = 0, visionDentalUnit = 0;
  let plan1Count = 0, plan2Count = 0, visionDentalCount = 0;
  employees.forEach(emp => {
    if (emp.user && emp.user.insuranceApplications) {
      emp.user.insuranceApplications.forEach(app => {
        if (app.healthPlan === 'plan1' && typeof app.healthPlanPrice === 'number') {
          plan1Total += app.healthPlanPrice;
          plan1Unit = app.healthPlanPrice;
          plan1Count++;
        }
        if (app.healthPlan === 'plan2' && typeof app.healthPlanPrice === 'number') {
          plan2Total += app.healthPlanPrice;
          plan2Unit = app.healthPlanPrice;
          plan2Count++;
        }
        if (app.visionAndDentalPlan && typeof app.visionAndDentalPrice === 'number') {
          visionDentalTotal += app.visionAndDentalPrice;
          visionDentalUnit = app.visionAndDentalPrice;
          visionDentalCount++;
        }
      });
    }
  });

  page2.drawText(`Plan 1: ${plan1Count} × $${plan1Unit.toFixed(2)} = $${plan1Total.toFixed(2)}`, { x: startX2 + 10, y: rowY2, size: 11, font }); rowY2 -= 13;
  page2.drawText(`Plan 2: ${plan2Count} × $${plan2Unit.toFixed(2)} = $${plan2Total.toFixed(2)}`, { x: startX2 + 10, y: rowY2, size: 11, font }); rowY2 -= 13;
  page2.drawText(`Vision & Dental Plan: ${visionDentalCount} × $${visionDentalUnit.toFixed(2)} = $${visionDentalTotal.toFixed(2)}`, { x: startX2 + 10, y: rowY2, size: 11, font }); rowY2 -= 13;
page2.drawText(`Ancillary Plans: ${ancillaryTotals.count} | $${ancillaryTotals.totalPrice.toFixed(2)}`, { x: startX2 + 10, y: rowY2, size: 11, font }); rowY2 -= 13;
page2.drawText(`One-Time Plan Fee(s): $${totalOneTimeFee.toFixed(2)}`, { x: startX2 + 10, y: rowY2, size: 11, font }); rowY2 -= 13;
page2.drawText(`Grand Total: $${plan1Total + plan2Total + visionDentalTotal + ancillaryTotals.totalPrice + totalOneTimeFee} + $${selectedMonthlyFee} per month`, { x: startX2 + 10, y: rowY2, size: 11, font }); rowY2 -= 13;



// --- Signature Section on Page 2 ---
rowY2 -= 40;
page2.drawText('Signature:', { x: startX2, y: rowY2, size: 12, font: fontBold });
const pngImage = await pdfDoc.embedPng(signatureDataUrl);
page2.drawImage(pngImage, { x: startX2 + 80, y: rowY2 - 80, width: 200, height: 80 });

page2.drawText(`Date Signed: ${new Date().toLocaleString()}`, {
  x: startX2,
  y: rowY2 - 100,
  size: 10,
  font,
  color: rgb(0.3, 0.3, 0.3),
});















  

  // Footer
  page2.drawText(
    'By signing electronically, you confirm your consent to recurring charges and acknowledge this as a legal signature under the E-Sign Act.',
    {
      x: 50,
      y: 80,
      size: 10,
      font,
      lineHeight: 12,
      color: rgb(0.25, 0.25, 0.25),
      maxWidth: 480,
    }
  );

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}



async function submitForm(auth: PaymentAuthorization) {
  const pad = signaturePads[auth.id];
  if (!pad || pad.isEmpty()) {
    error.value = 'Please sign before submitting.';
    return;
  }
  if (!consent[auth.id]) {
    error.value = 'You must consent to e-sign this authorization.';
    return;
  }

  error.value = '';
  message.value = '';

  const signatureDataUrl = pad.toDataURL();
 const pdfBlob = await generatePdf(
  auth,
  signatureDataUrl,
  employees.value,
  planCounts.value,
  ancillaryTotals.value,
  allAncillaryPlans.value,
  totalOneTimeFee.value,
  selectedMonthlyFee.value
);

  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'payment_authorization.pdf');
  formData.append('signatureImageUrl', signatureDataUrl);
  formData.append('amount', auth.amount.toString());
  formData.append('currency', auth.currency);
  formData.append('paymentMethod', auth.paymentMethod);
  formData.append('description', auth.description || '');
  formData.append('fullName', auth.fullName);
  formData.append('email', auth.email);

  try {
    const authToken = useCookie('auth_token').value;
    const res = await axios.post('/api/payment-authorization/sign', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      },
    });
    auth.pdfUrl = res.data.pdfUrl;
    message.value = 'Payment authorization signed successfully!';
    emit("completed")
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data?.message || err.message || 'Failed to submit';
  }
}

function downloadExistingPdf(url: string) {
  window.open(url, '_blank');
}


</script>
