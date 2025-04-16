import { setTimeout } from "timers/promises";
import { customEveFetchArgs, customEveFetchResponse } from "./typings/types.js";
import { getEveToken } from "../seat-database/queries.js";

let errorLimitRemain: number = 100; // 100 errors allowed per minute
let errorLimitReset: number = 60; // number of seconds after which rate limit expires =  1min

export const customEveFetch = async <T>(
  args: customEveFetchArgs
): Promise<customEveFetchResponse<T>> => {
  if (errorLimitRemain <= 10) await setTimeout(1000 * errorLimitReset + 1); // added extra one second just in case

  const { token } = await getEveToken();
  const res = await fetch(`${process.env.EVE_API_BASE_URL}${args.url}`, {
    method: args.method || "GET",

    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent":
        "Emergency Broadcast Bot/1.0.0 (discord: 492456685693173764)", // user agent as their docs say for contact info, put philips id
      ...args.headers,
    },
    body: args.body ? JSON.stringify(args.body) : undefined,
  });

  const { headers } = res;

  const errorLimitRemainHeader = headers.get("x-esi-error-limit-remain");
  const errorLimitResetHeader = headers.get("x-esi-error-limit-reset");
  const expiresHeader = headers.get("expires")!;

  // console.log({ errorLimitRemainHeader, errorLimitResetHeader, expiresHeader });

  if (errorLimitRemainHeader) errorLimitRemain = Number(errorLimitRemainHeader);
  if (errorLimitRemainHeader) errorLimitReset = Number(errorLimitResetHeader);

  let data;

  // some services return problematic+json so checking with json only NOT application/json
  if (headers.get("content-type")?.includes("json")) data = await res.json();

  if (headers.get("content-type")?.includes("text")) data = await res.text();

  if (!data) data = await res.json();

  if (!res.ok) {
    console.log(res);
    console.log(data);
    throw new Error(res.statusText);
  }

  return { expires: expiresHeader, data };
};
