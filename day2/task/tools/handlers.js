import { AI_DEVS_API_KEY, GEOCODE_API_KEY } from "../../../config.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const handlers = {
  async suspect_location({ name, surname }) {
    const payload = {
      apikey: AI_DEVS_API_KEY,
      name,
      surname
    };

    const response = await fetch("https://hub.ag3nts.org/api/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Location API error: ${response.status} ${response.statusText} - ${rawText}`);
    }

    const data = JSON.parse(rawText);

    if (!Array.isArray(data)) {
      throw new Error(`Invalid location API response format: ${rawText}`);
    }

    return data.map((item) => ({
      latitude: Number(item.latitude),
      longitude: Number(item.longitude)
    }));
  },

  async geocode_city({ city }) {
    await sleep(300);

    const url = new URL("https://geocode.maps.co/search");
    url.searchParams.set("q", `${city}, Poland`);
    url.searchParams.set("api_key", GEOCODE_API_KEY);

    const response = await fetch(url);
    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText} - ${rawText}`);
    }

    const data = JSON.parse(rawText);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`City not found: ${city}`);
    }

    return {
      city,
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
      displayName: data[0].display_name
    };
  },

  async get_suspect_access({ name, surname, birthYear, powerPlant }) {
    const payload = {
      apikey: AI_DEVS_API_KEY,
      name,
      surname,
      birthYear
    };

    const response = await fetch("https://hub.ag3nts.org/api/accesslevel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Access API error: ${response.status} ${response.statusText} - ${rawText}`);
    }

    const data = JSON.parse(rawText);

    return {
      name,
      surname,
      accessLevel: Number(data.accessLevel),
      powerPlant
    };
  }
};