<template>
  <PatternSection>
    <BasicSlider :slides="imageSlides" />
    <Ribbon />
    <TransformYourBusiness />
  </PatternSection>
</template>

<script setup>
import BenefitsGrid from "@/components/Home/BenefitsGrid.vue"
import MembershipBenefits from "@/components/Home/MembershipBenefits.vue"



const imageSlides = [
  {
    image: "/img/Business-Consultant.jpg",
    title: "National Business Benefit Alliance",
    description:
      "Empowering entrepreneurs and business owners with the tools, resources, and network they need to thrive in today's competitive marketplace. Join a community of forward-thinking business professionals committed to mutual success and growth.",
    buttonText: "Become a Member",
    link: "/login",
    buttonText2: "Learn More",
    link2: "/Member-Info",
  },
  {
    image: "/img/Join-us.jpg",
    content: BenefitsGrid, //instead of description, inject the component
  },
    {
    image: "/img/support.jpg",
    content: MembershipBenefits, //instead of description, inject the component
  },
];

</script>
