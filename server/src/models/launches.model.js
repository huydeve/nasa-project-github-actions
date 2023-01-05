const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");
// const launches = new Map();
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
const DEFAULT_FLIGHT_NUMBER = 100;

async function populateLaunches() {
  // console.log("Downloading launch");
  // const firstLaunch = await findLaunch({
  //   flightNumber: 1,
  //   rocket: "Falcon 1",
  //   mission: "FalconSat",
  // });
  // if (firstLaunch) console.log("launch data already loaded");
  // else await populateLaunches();
  // const response = await axios.post(SPACEX_API_URL, {
  //   query: {},
  //   options: {
  //     pagination: false,
  //     populate: [
  //       {
  //         path: "rocket",
  //         select: {
  //           name: 1,
  //         },
  //       },
  //     ],
  //   },
  // });
  // if (response.status !== 200) {
  //   console.log("problem downloading launchData");
  //   throw new Error("Launch data download failed");
  // }
  // const launchDocs = response.data.docs;
  // for (const launchDoc of launchDocs) {
  //   const payloads = launchDoc["payloads"];
  //   const customers = payloads.flatMap((payload) => {
  //     return payload;
  //   });
  //   const launch = {
  //     flightNumber: launchDoc["flight_number"],
  //     mission: launchDoc["name"],
  //     rocket: launchDoc["rocket"]["name"],
  //     launchDate: launchDoc["date_local"],
  //     upcoming: launchDoc["upcoming"],
  //     success: launchDoc["success"],
  //     customers,
  //   };
  //   console.log(`${launch.flightNumber} ${launch.mission}`);
  // }
}
async function loadLaunchesData() {
  console.log("Downloading launch");
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) console.log("launch data already loaded");
  else await populateLaunches();

  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("problem downloading launchData");
    throw new Error("Launch data download failed");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload;
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      target: "Chuc yeu",
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(launch);
    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function existLaunchWithId(id) {
  const launch = await findLaunch({
    flightNumber: id,
  });
  return Boolean(launch);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne({}).sort("-flightNumber");
  let result = DEFAULT_FLIGHT_NUMBER;
  if (latestLaunch) result = latestLaunch.flightNumber;
  return result;
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("Not match target");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}

//  function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launch.launchDate = new Date(launch.launchDate);
//   return launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customer: ["ZTM", "NASA"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  console.log(aborted);
  return aborted.modifiedCount === 1;
}
module.exports = {
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  loadLaunchesData,
};
