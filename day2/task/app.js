import fs from "node:fs/promises";
import path from "node:path";
import { handlers } from "./tools/handlers.js";
import { haversineDistanceKm } from "./utils/geo.js";

const SUSPECTS_PATH = path.resolve("./suspects.json");
const POWER_PLANTS_PATH = path.resolve("./power-plants.json");

const MAX_DISTANCE_KM = 10;

const loadPowerPlants = async () => {
  const raw = await fs.readFile(POWER_PLANTS_PATH, "utf-8");
  const data = JSON.parse(raw);

  const source = data.power_plants ?? {};
  const plants = [];

  for (const [city, value] of Object.entries(source)) {
    if (!value?.is_active) continue;

    plants.push({
      city,
      code: value.code
    });
  }

  return plants;
};

const geocodePowerPlants = async (powerPlants) => {
  const geocoded = [];

  for (const plant of powerPlants) {
    try {
      const geo = await handlers.geocode_city({ city: plant.city });

      geocoded.push({
        ...plant,
        latitude: geo.latitude,
        longitude: geo.longitude
      });

      console.log(
        `Geocoded ${plant.city}: ${geo.latitude}, ${geo.longitude}`
      );
    } catch (error) {
      console.error(`Failed to geocode ${plant.city}: ${error.message}`);
    }
  }

  return geocoded;
};

const findClosestPlantForSuspect = (locations, powerPlants, maxDistanceKm) => {
  let bestMatch = null;

  for (const location of locations) {
    for (const plant of powerPlants) {
      const distanceKm = haversineDistanceKm(
        location.latitude,
        location.longitude,
        plant.latitude,
        plant.longitude
      );

      if (distanceKm <= maxDistanceKm) {
        if (!bestMatch || distanceKm < bestMatch.distanceKm) {
          bestMatch = {
            city: plant.city,
            powerPlant: plant.code,
            distanceKm
          };
        }
      }
    }
  }

  return bestMatch;
};

const main = async () => {
  const suspects = JSON.parse(await fs.readFile(SUSPECTS_PATH, "utf-8"));
  const rawPowerPlants = await loadPowerPlants();
  const powerPlants = await geocodePowerPlants(rawPowerPlants);

  if (!powerPlants.length) {
    throw new Error("No geocoded power plants available");
  }

  const candidates = [];

  for (const suspect of suspects) {
    try {
      console.log(`\nChecking ${suspect.name} ${suspect.surname}...`);

      const locations = await handlers.suspect_location({
        name: suspect.name,
        surname: suspect.surname
      });

      if (!locations.length) {
        console.log("  No locations found");
        continue;
      }

      const bestMatch = findClosestPlantForSuspect(
        locations,
        powerPlants,
        MAX_DISTANCE_KM
      );

      if (!bestMatch) {
        console.log("  No nearby power plant");
        continue;
      }

      console.log(
        `  Match: ${bestMatch.city} (${bestMatch.powerPlant}), distance ${bestMatch.distanceKm.toFixed(2)} km`
      );

      const accessData = await handlers.get_suspect_access({
        name: suspect.name,
        surname: suspect.surname,
        birthYear: suspect.born,
        powerPlant: bestMatch.powerPlant
      });

      candidates.push({
        ...accessData,
        city: bestMatch.city,
        distanceKm: bestMatch.distanceKm
      });
    } catch (error) {
      console.error(`Error for ${suspect.name} ${suspect.surname}: ${error.message}`);
    }
  }

  if (!candidates.length) {
    throw new Error("No candidates found");
  }
  console.log("\nBEST CANDIDATES:");
  console.log(JSON.stringify(candidates, null, 2));
};

main().catch(console.error);