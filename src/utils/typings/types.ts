import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

export interface extendedAPICommand
  extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  permissionRequired?: bigint | Array<bigint>;
  guildOnly?: Boolean;
  autocomplete?(
    interaction: AutocompleteInteraction
  ): Promise<Array<ApplicationCommandOptionChoiceData | string>>;
  execute(interaction: ChatInputCommandInteraction): Promise<any>;
}

export interface customEveFetchArgs {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: [] | Record<string, any>;
}

export type killMailRecentResponse = Array<{
  killmail_id: number;
  killmail_hash: string;
}>;

export interface customEveFetchResponse<T> {
  expires: string;
  data: T;
}

export type Killmail = {
  killmail_id: number;
  killmail_time: string; // ISO date string
  solar_system_id: number;
  attackers: Attacker[];
  victim: Victim;
};

export type Character = { name: string };
export type Corporation = { name: string };
export type Ship = { name: string };
export type SolarSystem = { constellation_id: number; name: string };
export type Constellation = { region_id: number; name: string };
export type Region = { region_id: number; name: string };

export type customSolarSystemInfo = { name: string; region_name: string };

export type FuzzWorksMarketData = {
  [itemId: string]: ItemStats;
};

type Attacker = {
  damage_done: number;
  final_blow: boolean;
  security_status: number;
  ship_type_id: number;
  faction_id?: number;
  alliance_id?: number;
  character_id?: number;
  corporation_id?: number;
  weapon_type_id?: number;
};

type Victim = {
  damage_taken: number;
  ship_type_id: number;
  character_id: number;
  corporation_id: number;
  alliance_id?: number;
  items: Item[];
  position: Position;
};

type Item = {
  flag: number;
  item_type_id: number;
  quantity_destroyed?: number;
  quantity_dropped?: number;
  singleton: number;
  items?: Item[];
};

type Position = {
  x: number;
  y: number;
  z: number;
};

type OrderStats = {
  weightedAverage: string;
  max: string;
  min: string;
  stddev: string;
  median: string;
  volume: string;
  orderCount: string;
  percentile: string;
};

export type ItemStats = {
  buy: OrderStats;
  sell: OrderStats;
};
