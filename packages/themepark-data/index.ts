/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
// import Themeparks from 'themeparks';

// configure where SQLite DB sits
// optional - will be created in node working directory if not configured
// Themeparks.Settings.Cache = __dirname + "/themeparks.db";

// access a specific park
//  Create this *ONCE* and re-use this object for the lifetime of your application
//  re-creating this every time you require access is very slow, and will fetch data repeatedly for no purpose

//removed water parks
const monitoredDestinations = [
  {
    id: 'e957da41-3552-4cf6-b636-5babc5cbc4e5',
    name: 'Walt Disney World® Resort',
    slug: 'waltdisneyworldresort',
    parks: [
      {
        id: '75ea578a-adc8-4116-a54d-dccb60765ef9',
        name: 'Magic Kingdom Park'
      },
      {
        id: '47f90d2c-e191-4239-a466-5892ef59a88b',
        name: 'EPCOT'
      },
      {
        id: '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
        name: "Disney's Hollywood Studios"
      },
      {
        id: '1c84a229-8862-4648-9c71-378ddd2c7693',
        name: "Disney's Animal Kingdom Theme Park"
      }
    ]
  },
  {
    id: '89db5d43-c434-4097-b71f-f6869f495a22',
    name: 'Universal Orlando Resort',
    slug: 'universalorlando',
    parks: [
      {
        id: 'eb3f4560-2383-4a36-9152-6b3e5ed6bc57',
        name: 'Universal Studios Florida'
      },
      {
        id: '267615cc-8943-4c2a-ae2c-5da728ca591f',
        name: "Universal's Islands of Adventure"
      }
    ]
  }
];

// API docs
// https://api.themeparks.wiki/docs/v1/#/

const CheckWaitTimes = async () => {
  // console.log(Themeparks);
  // console.log(Themeparks.DestinationsApi);
  // const destinationsApi = new Themeparks.DestinationsApi();

  // const destinations = await Themeparks.Destinations.getDestinations();
  try {
    const outputPath = '/mnt/devhome/themeparks';

    // const DisneyWorldMagicKingdom = new Themeparks.Parks.WaltDisneyWorldMagicKingdom();

    const parkId = monitoredDestinations[0]?.parks[0]?.id;

    if (parkId) {
      const parkEntity = await (await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}`)).json();

      console.log(JSON.stringify(parkEntity, null, 2));

      const parkChildren = await (await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/children`)).json();

      console.log(JSON.stringify(parkChildren, null, 2));

      // //will get all the data
      const liveChildren = await (await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/live`)).json();

      console.log(JSON.stringify(liveChildren, null, 2));

      const jungleCruiseId = '796b0a25-c51e-456e-9bb8-50a324e301b3';

      const jungleCruiseLive = await (
        await fetch(`https://api.themeparks.wiki/v1/entity/${jungleCruiseId}/live`)
      ).json();
      console.log(JSON.stringify(jungleCruiseLive, null, 2));

      const jungleCruiseDetails = await (await fetch(`https://api.themeparks.wiki/v1/entity/${jungleCruiseId}`)).json();
      console.log(JSON.stringify(jungleCruiseDetails, null, 2));
    }

    const destinations = await (await fetch('https://api.themeparks.wiki/v1/destinations')).json();
    console.log(destinations);

    writeJson(outputPath, 'destinations.json', destinations);
    console.log(JSON.stringify(destinations, null, 2));
  } catch (error) {
    console.error(error);
  }

  await new Promise(resolve => setTimeout(resolve, 5000));
};

await CheckWaitTimes();

function writeJson(outputPath: string, filename: string, rideTimes: any) {
  fs.mkdirSync(outputPath, { recursive: true });
  fs.writeFileSync(path.join(outputPath, filename), JSON.stringify(rideTimes));
}
