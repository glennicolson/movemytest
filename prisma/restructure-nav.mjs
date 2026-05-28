import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Delete all existing HEADER nav items (children first, then parents)
  await prisma.navigationItem.deleteMany({ where: { location: "HEADER" } });

  // 2. Create new grouped structure
  // Group 1: Learn to Drive
  const learn = await prisma.navigationItem.create({
    data: {
      id: "nav-learn",
      location: "HEADER",
      label: "Learn to Drive",
      href: "/driving-lessons",
      description: "Driving lessons tailored to you",
      sortOrder: 0,
      isActive: true,
      children: {
        create: [
          { id: "nav-lessons", location: "HEADER", label: "Driving Lessons", href: "/driving-lessons", description: "All lesson types and info", icon: "🚗", sortOrder: 0, isActive: true },
          { id: "nav-prices", location: "HEADER", label: "Prices", href: "/prices", description: "Lesson pricing and packages", icon: "💷", sortOrder: 1, isActive: true },
          { id: "nav-areas", location: "HEADER", label: "Areas We Cover", href: "/areas", description: "Find your local area", icon: "📍", sortOrder: 2, isActive: true },
          { id: "nav-faq", location: "HEADER", label: "FAQ", href: "/faq", description: "Common questions answered", icon: "❓", sortOrder: 3, isActive: true },
          { id: "nav-learner-help", location: "HEADER", label: "Learner Help", href: "/learner-help", description: "Tips and guides for learners", icon: "📖", sortOrder: 4, isActive: true },
        ],
      },
    },
  });

  // Group 2: Instructors
  const instructors = await prisma.navigationItem.create({
    data: {
      id: "nav-instructors",
      location: "HEADER",
      label: "Instructors",
      href: "/instructors",
      description: "Meet our team",
      sortOrder: 1,
      isActive: true,
      children: {
        create: [
          { id: "nav-meet", location: "HEADER", label: "Meet the Team", href: "/instructors", description: "Our DVSA-approved instructors", icon: "👨‍🏫", sortOrder: 0, isActive: true },
          { id: "nav-become", location: "HEADER", label: "Become an Instructor", href: "/become-an-instructor", description: "Join the DTC team", icon: "🤝", sortOrder: 1, isActive: true },
        ],
      },
    },
  });

  // Group 3: About Us
  const about = await prisma.navigationItem.create({
    data: {
      id: "nav-about",
      location: "HEADER",
      label: "About Us",
      href: "/about",
      description: "Who we are",
      sortOrder: 2,
      isActive: true,
      children: {
        create: [
          { id: "nav-about-dtc", location: "HEADER", label: "About The DTC", href: "/about", description: "Our story and values", icon: "🏢", sortOrder: 0, isActive: true },
          { id: "nav-blog", location: "HEADER", label: "Blog", href: "/blog", description: "News and updates", icon: "📝", sortOrder: 1, isActive: true },
        ],
      },
    },
  });

  // Group 4: Resources
  const resources = await prisma.navigationItem.create({
    data: {
      id: "nav-resources",
      location: "HEADER",
      label: "Resources",
      href: "/resource-hub",
      description: "Helpful tools and guides",
      sortOrder: 3,
      isActive: true,
      children: {
        create: [
          { id: "nav-hub", location: "HEADER", label: "Resource Hub", href: "/resource-hub", description: "All our resources", icon: "📚", sortOrder: 0, isActive: true },
          { id: "nav-theory", location: "HEADER", label: "Theory Test Help", href: "/resource-hub/theory-test-help", description: "Prepare for your theory", icon: "🧠", sortOrder: 1, isActive: true },
          { id: "nav-driving-test", location: "HEADER", label: "Driving Test Help", href: "/resource-hub/driving-test-help", description: "Practical test advice", icon: "🛣️", sortOrder: 2, isActive: true },
          { id: "nav-local", location: "HEADER", label: "Local Advice", href: "/resource-hub/local-driving-advice", description: "Area-specific tips", icon: "🗺️", sortOrder: 3, isActive: true },
        ],
      },
    },
  });

  // Group 5: Support
  const support = await prisma.navigationItem.create({
    data: {
      id: "nav-support",
      location: "HEADER",
      label: "Support",
      href: "/contact",
      description: "Get in touch",
      sortOrder: 4,
      isActive: true,
      children: {
        create: [
          { id: "nav-contact", location: "HEADER", label: "Contact Us", href: "/contact", description: "Send us a message", icon: "✉️", sortOrder: 0, isActive: true },
        ],
      },
    },
  });

  console.log("✅ Nav restructure complete.");
  console.log({ learn: learn.id, instructors: instructors.id, about: about.id, resources: resources.id, support: support.id });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
