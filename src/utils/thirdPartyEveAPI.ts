import { FuzzWorksMarketData } from "./typings/types.js";

export const fetchItemMarketPrices = async (
  itemIds: number[]
): Promise<FuzzWorksMarketData> => {
  const res = await fetch(
    `${process.env.FUZZ_WORK_API_BASE_URL}/aggregates/?region=${process.env.EVE_FORGE_REGION_ID}&types=${itemIds.join(",")}`
  );

  console.log(res);

  return res.json();
};
