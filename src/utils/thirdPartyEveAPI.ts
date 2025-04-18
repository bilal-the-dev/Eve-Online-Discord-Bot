import { zkillboardMarketData } from "./typings/types.js";

export const fetchItemMarketPrice = async (
  itemId: number
): Promise<zkillboardMarketData> => {
  const res = await fetch(
    `${process.env.ZKILLBOARD_API_BASE_URL}/prices/${itemId}/`
  );

  console.log(res);

  return res.json();
};
