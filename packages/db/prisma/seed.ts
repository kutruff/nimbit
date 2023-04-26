/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // log: ["query"],
});

// prisma.$on("query", (e) => {
//   // console.log("Query: " + e.query);
//   console.log("Params: " + e.params);
//   console.log("Duration: " + e.duration + "ms\n");
// });

async function main() {
  const firstPostId = '5c03994c-fc16-47e0-bd02-d218a370a078';
  await prisma.post.upsert({
    where: {
      id: firstPostId,
    },
    create: {
      id: firstPostId,
      title: 'First Post',
      content: 'This is an example post generated from `prisma/seed.ts`',
      note: 'This is a note',
      secondNote: 'This is another note',
    },
    update: {},
  });

  const beastExperienceId = '5f0bd6de-f2cf-4ae8-bff0-7c8a45926335';
  const beastRideId = '827023e8-565c-40f2-97a1-392dbc4664ad';

  await prisma.experience.upsert({
    where: {
      id: beastExperienceId,
    },
    create: {
      id: beastExperienceId,
      title: 'The Beast',
      description: 'Classic wooden roller coaster.',
      ride: {
        connectOrCreate: {
          create: {
            id: beastRideId,
            minimumHeight: 48,
          },
          where: {
            id: beastRideId,
          },
        },
      },
    },
    update: {},
  });

  const festhausExperienceId = 'e7c7cd54-05bc-48f6-a6d7-b256ef943f12';
  const festhausRestaurantId = '5b5fb171-9af7-4f2e-bad5-639631bbb4d9';

  await prisma.experience.upsert({
    where: {
      id: festhausExperienceId,
    },
    create: {
      id: festhausExperienceId,
      title: 'Festhaus',
      description: 'Place to eat.',
      restaurant: {
        connectOrCreate: {
          create: {
            id: festhausRestaurantId,
            cuisine: 'junk food',
            servesAlcohol: true,
          },
          where: {
            id: festhausRestaurantId,
          },
        },
      },
    },
    update: {},
  });

  const itineraryId = '7b2a5c02-b3b1-47c9-ab22-632ebb01c512';
  await prisma.itinerary.upsert({
    where: {
      id: itineraryId,
    },
    create: {
      id: itineraryId,
      title: 'My trip to Kings Island',
      description: 'Winter 2020 the family is going.',
    },
    update: {},
  });

  const entryId0 = 'ff2c24dd-5742-43ba-9578-ad5f92137679';
  await prisma.itineraryEntry.upsert({
    where: {
      id: entryId0,
    },
    create: {
      id: entryId0,
      startTime: new Date('09 September 2011 14:48 UTC').toISOString(),
      endTime: new Date('09 September 2011 16:48 UTC').toISOString(),
      notes: 'This is a note',
      experienceId: beastExperienceId,
      itineraryId: itineraryId,
    },
    update: {},
  });

  const entryId1 = '491fa149-40ef-44e2-ab3f-401a06a4467b';
  await prisma.itineraryEntry.upsert({
    where: {
      id: entryId1,
    },
    create: {
      id: entryId1,
      startTime: new Date('09 September 2011 16:48 UTC').toISOString(),
      endTime: new Date('09 September 2011 18:48 UTC').toISOString(),
      notes: 'This is a dinner ',
      experienceId: festhausExperienceId,
      itineraryId: itineraryId,
    },
    update: {},
  });

  let nextExperienceId = 0;
  let nextRideId = 0;
  let nextRestaurantId = 0;
  let nextItineraryId = 0;
  let nextItineraryEntryId = 0;

  for (let i = 0; i < 1000; i++) {
    const beastExperienceId = (nextExperienceId++).toString();
    const beastRideId = (nextRideId++).toString();

    await prisma.experience.upsert({
      where: {
        id: beastExperienceId,
      },
      create: {
        id: beastExperienceId,
        title: 'The Beast',
        description: 'Classic wooden roller coaster.',
        ride: {
          connectOrCreate: {
            create: {
              id: beastRideId,
              minimumHeight: 48,
            },
            where: {
              id: beastRideId,
            },
          },
        },
      },
      update: {},
    });

    const festhausExperienceId = (nextExperienceId++).toString();
    const festhausRestaurantId = (nextRestaurantId++).toString();

    await prisma.experience.upsert({
      where: {
        id: festhausExperienceId,
      },
      create: {
        id: festhausExperienceId,
        title: 'Festhaus',
        description: 'Place to eat.',
        restaurant: {
          connectOrCreate: {
            create: {
              id: festhausRestaurantId,
              cuisine: 'junk food',
              servesAlcohol: true,
            },
            where: {
              id: festhausRestaurantId,
            },
          },
        },
      },
      update: {},
    });

    const itineraryId = (nextItineraryId++).toString();
    await prisma.itinerary.upsert({
      where: {
        id: itineraryId,
      },
      create: {
        id: itineraryId,
        title: 'My trip to Kings Island',
        description: 'Winter 2020 the family is going.',
      },
      update: {},
    });

    const entryId0 = (nextItineraryEntryId++).toString();
    await prisma.itineraryEntry.upsert({
      where: {
        id: entryId0,
      },
      create: {
        id: entryId0,
        startTime: new Date('09 September 2011 14:48 UTC').toISOString(),
        endTime: new Date('09 September 2011 16:48 UTC').toISOString(),
        notes: 'This is a note',
        experienceId: beastExperienceId,
        itineraryId: itineraryId,
      },
      update: {},
    });

    const entryId1 = (nextItineraryEntryId++).toString();
    await prisma.itineraryEntry.upsert({
      where: {
        id: entryId1,
      },
      create: {
        id: entryId1,
        startTime: new Date('09 September 2011 16:48 UTC').toISOString(),
        endTime: new Date('09 September 2011 18:48 UTC').toISOString(),
        notes: 'This is a dinner ',
        experienceId: festhausExperienceId,
        itineraryId: itineraryId,
      },
      update: {},
    });
  }
  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@---------');
  const results = await prisma.itinerary.findUnique({
    where: {
      id: itineraryId,
    },
    include: {
      itineraryEntries: {
        include: {
          experience: true,
        },
      },
    },
  });
  console.log(JSON.stringify(results, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
