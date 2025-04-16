import {
  Character,
  Constellation,
  Corporation,
  customEveFetchResponse,
  customSolarSystemInfo,
  Killmail,
  killMailRecentResponse,
  Region,
  Ship,
  SolarSystem,
} from "./typings/types.js";

import { customEveFetch } from "./customEveFetch.js";

export const fetchKillMails = async (
  corporationId: number
): Promise<customEveFetchResponse<killMailRecentResponse>> => {
  const data = await customEveFetch<killMailRecentResponse>({
    url: `/corporations/${corporationId}/killmails/recent`,
  });

  return data;
};

export const fetchKillMailDetails = async (
  killMailId: number,
  killMailHash: string
): Promise<customEveFetchResponse<Killmail>> => {
  const data = await customEveFetch<Killmail>({
    url: `/killmails/${killMailId}/${killMailHash}/
`,
  });

  return data;
};

export const fetchCharacterDetails = async (
  characterId: number
): Promise<customEveFetchResponse<Character>> => {
  const data = await customEveFetch<Character>({
    url: `/characters/${characterId}
`,
  });

  return data;
};

export const fetchCorportationDetails = async (
  corporationId: number
): Promise<customEveFetchResponse<Corporation>> => {
  const data = await customEveFetch<Corporation>({
    url: `/corporations/${corporationId}
`,
  });

  return data;
};

export const fetchShipDetails = async (
  shipId: number
): Promise<customEveFetchResponse<Ship>> => {
  const data = await customEveFetch<Ship>({
    url: `/universe/types/${shipId}`,
  });

  return data;
};

export const fetchSolarSystemDetails = async (
  solarSystemId: number
): Promise<customSolarSystemInfo> => {
  const solarSystem = await customEveFetch<SolarSystem>({
    url: `/universe/systems/${solarSystemId}`,
  });

  const constellation = await customEveFetch<Constellation>({
    url: `/universe/constellations/${solarSystem.data.constellation_id}`,
  });

  const region = await customEveFetch<Region>({
    url: `/universe/regions/${constellation.data.region_id}`,
  });

  return { name: solarSystem.data.name, region_name: region.data.name };
};
