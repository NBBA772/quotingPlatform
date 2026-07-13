// server/api/applications/save.post.ts
import prisma from '~/server/database/client'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import { getCookie, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const authToken = getCookie(event, 'auth_token')
    if (!authToken) {
      throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })
    }

    const loggedInUser = await getUserByAuthToken(authToken)
    if (!loggedInUser) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired session' })
    }

    const body = await readBody(event)
    const {
      userId,
      groupName,
      coverageTier,
      firstName,
      middleName,
      lastName,
      phoneNumber,
      email,
      streetAddress,
      city,
      state,
      zipCode,
      socialSecurityNumber,
      hrsPerWeek,
      jobTitle,
      dateOfBirth,
      hireDate,
      rehireDate,
      location,
      isDivision,
      parentCompany,
      age,
      gender,
      weight,
      height,
      healthPlan,
      healthPlanPrice,
      visionAndDentalPlan,
      visionAndDentalPrice,
      lifeAncillaryPlan,
      reasons,
      spouseFirstName,
      spouseMiddleName,
      spouseLastName,
      spouseSocialSecurityNumber,
      spouseDateOfBirth,
      spouseAge,
      spouseGender,
      spouseWeight,
      spouseHeight,
      dependents = [],
      ancillaryPlans = [],
      waiveOneTimeFee
    } = body

    // if (
    //   !userId ||
    //   !firstName ||
    //   !lastName ||
    //   !phoneNumber ||
    //   !email ||
    //   !jobTitle ||
    //   !hrsPerWeek ||
    //   !hireDate ||
    //   isDivision === undefined ||
    //   !age ||
    //   !gender ||
    //   !weight ||
    //   !height ||
    //   !socialSecurityNumber ||
    //   !dateOfBirth
    // ) {
    //   throw createError({
    //     statusCode: 400,
    //     statusMessage: 'Required fields missing',
    //   })
    // }

    // Optional role check
    if (
      !loggedInUser.appAdminId &&
      !loggedInUser.companyAdminId &&
      !loggedInUser.insuranceAgent &&
      loggedInUser.id !== userId
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Not authorized to save application',
      })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    })
    if (!targetUser) {
      throw createError({ statusCode: 404, statusMessage: 'Target user not found' })
    }

    const normalizeDate = (val: any) => (!val || val === '' ? null : new Date(val))
    const normalizeReasons = (val: any) => (!val ? null : Array.isArray(val) ? val.join(',') : val)

    // Find existing application
    let application = await prisma.insuranceApplication.findFirst({ where: { userId } })

    // NPN entered on the form; keep any prior value if omitted
    const groupNumber = body.groupNumber || application?.groupNumber || ''

    if (application) {
      application = await prisma.insuranceApplication.update({
        where: { id: application.id },
        data: {
          waiveOneTimeFee,
          groupNumber, // NPN from the form
          groupName,
          coverageTier,
          firstName,
          middleName,
          lastName,
          phoneNumber,
          email,
          streetAddress,
          city,
          state,
          zipCode,
          socialSecurityNumber,
          hireDate: normalizeDate(hireDate),
          rehireDate: normalizeDate(rehireDate),
          location,
          isDivision,
          parentCompany,
          jobTitle,
          hrsPerWeek,
          age,
          gender,
          weight,
          height,
          dateOfBirth: normalizeDate(dateOfBirth),
          healthPlan,
          healthPlanPrice: healthPlanPrice !== undefined ? parseFloat(healthPlanPrice) : null,
          visionAndDentalPlan,
          visionAndDentalPrice: visionAndDentalPrice !== undefined ? parseFloat(visionAndDentalPrice) : null,
          lifeAncillaryPlan: lifeAncillaryPlan || null,
          reasons: normalizeReasons(reasons),
          spouseFirstName,
          spouseMiddleName,
          spouseLastName,
          spouseSocialSecurityNumber,
          spouseDateOfBirth: normalizeDate(spouseDateOfBirth),
          spouseAge,
          spouseGender,
          spouseWeight,
          spouseHeight,
          // An explicit array (even empty) replaces the dependents, so
          // switching to a tier without children clears them
          dependents: Array.isArray(dependents)
            ? {
                deleteMany: {},
                create: dependents.map((dep: any) => ({
                  firstName: dep.firstName,
                  lastName: dep.lastName,
                  dateOfBirth: normalizeDate(dep.dateOfBirth),
                  gender: dep.gender,
                  socialSecurityNumber: dep.socialSecurityNumber,
                  weight: dep.weight,
                  height: dep.height,
                  relationship: dep.relationship,
                })),
              }
            : undefined,
          ancillaryPlans: ancillaryPlans.length
            ? {
                deleteMany: {},
                create: ancillaryPlans.map((plan: any) => ({
                  planName: plan.planName,
                  product: plan.product,
                  price: parseFloat(plan.price),
                })),
              }
            : undefined,
        },
        include: { dependents: true, ancillaryPlans: true },
      })
    } else {
      application = await prisma.insuranceApplication.create({
        data: {
          userId,
          waiveOneTimeFee,
          groupNumber, // NPN from the form
          groupName,
          coverageTier,
          firstName,
          middleName,
          lastName,
          phoneNumber,
          email,
          streetAddress,
          city,
          state,
          zipCode,
          socialSecurityNumber,
          hireDate: normalizeDate(hireDate),
          rehireDate: normalizeDate(rehireDate),
          location,
          isDivision,
          parentCompany,
          jobTitle,
          hrsPerWeek,
          age,
          gender,
          weight,
          height,
          dateOfBirth: normalizeDate(dateOfBirth),
          healthPlan,
          healthPlanPrice: healthPlanPrice !== undefined ? parseFloat(healthPlanPrice) : null,
          visionAndDentalPlan,
          visionAndDentalPrice: visionAndDentalPrice !== undefined ? parseFloat(visionAndDentalPrice) : null,
          lifeAncillaryPlan: lifeAncillaryPlan || null,
          reasons: normalizeReasons(reasons),
          spouseFirstName,
          spouseMiddleName,
          spouseLastName,
          spouseSocialSecurityNumber,
          spouseDateOfBirth: normalizeDate(spouseDateOfBirth),
          spouseAge,
          spouseGender,
          spouseWeight,
          spouseHeight,
          dependents: dependents.length
            ? {
                create: dependents.map((dep: any) => ({
                  firstName: dep.firstName,
                  lastName: dep.lastName,
                  dateOfBirth: normalizeDate(dep.dateOfBirth),
                  gender: dep.gender,
                  socialSecurityNumber: dep.socialSecurityNumber,
                  weight: dep.weight,
                  height: dep.height,
                  relationship: dep.relationship,
                })),
              }
            : undefined,
          ancillaryPlans: ancillaryPlans.length
            ? {
                create: ancillaryPlans.map((plan: any) => ({
                  planName: plan.planName,
                  product: plan.product,
                  price: parseFloat(plan.price),
                })),
              }
            : undefined,
        },
        include: { dependents: true, ancillaryPlans: true },
      })
    }

    return { success: true, application }
  } catch (err: any) {
    console.error('❌ Save application error:', err)
    throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to save application' })
  }
})
