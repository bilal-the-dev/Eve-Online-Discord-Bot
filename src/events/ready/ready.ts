import { Client, EmbedBuilder } from "discord.js";

import registerAndAttachCommandsOnClient from "../../utils/registrars/registerCommands.js";
import { killMailRecentResponse } from "../../utils/typings/types.js";
import {
  fetchCharacterDetails,
  fetchCorportationDetails,
  fetchKillMailDetails,
  fetchKillMails,
  fetchShipDetails,
  fetchSolarSystemDetails,
} from "../../utils/eveAPI.js";
import { fetchItemMarketPrice } from "../../utils/thirdPartyEveAPI.js";

const oldKillMails: killMailRecentResponse = [];

export default async (client: Client<true>) => {
  console.log(`${client.user.username} (${client.user.id}) is ready 🐬`);
  await registerAndAttachCommandsOnClient(client);

  // check for new killmails
  checkForNewKillMail(client);
};

async function checkForNewKillMail(client: Client<true>) {
  try {
    console.log(`Fetching new kill mails!`);

    const { EVE_CORPORATION_ID } = process.env;

    const { data, expires } = await fetchKillMails(Number(EVE_CORPORATION_ID));

    console.log(expires);
    console.log(new Date(expires));

    if (oldKillMails.length === 0) {
      oldKillMails.push(...data);

      console.log(data);

      console.log(`Filling first time in cache the kill mails`);
    }
    // const newKillMails = data.slice(0, 10);

    const newKillMails = data.filter((d) =>
      oldKillMails.every((o) => o.killmail_id !== d.killmail_id)
    );

    console.log(`Fetched ${newKillMails.length} new kill mails!`);

    console.log(newKillMails);

    for (const killMail of newKillMails) {
      try {
        const { data: details } = await fetchKillMailDetails(
          killMail.killmail_id,
          killMail.killmail_hash
        );

        const solarSystemInfo = await fetchSolarSystemDetails(
          details.solar_system_id
        );

        const promises = [
          fetchCharacterDetails(details.victim.character_id),
          fetchCorportationDetails(details.victim.corporation_id),
          fetchShipDetails(details.victim.ship_type_id),
        ];

        const [victimCh, victimCp, victimShip] = await Promise.all(promises);

        const channel = client.channels.cache.get(
          process.env.KILL_MAIL_CHANNEL_ID
        );

        const victimDeatils = `${victimCh.data.name} (${victimCp.data.name})`;
        let description = `${victimDeatils} lost their ${victimShip.data.name} in ${solarSystemInfo.name} (${solarSystemInfo.region_name}).`;

        const attacker = details.attackers.find((a) => a.final_blow); //find the one who gave final blow

        // checking with corp instead of ch because zkillboard bot was doing the same
        if (attacker?.corporation_id) {
          const promises = [];
          promises.push(
            fetchCharacterDetails(attacker.character_id!),
            fetchCorportationDetails(attacker.corporation_id),
            fetchShipDetails(attacker.ship_type_id)
          );
          const [attackerCh, attackerCp, attackerShip] =
            await Promise.all(promises);

          description += `  Final Blow by ${attackerCh.data.name} (${attackerCp.data.name}) flying in a ${attackerShip.data.name}.`;
        }

        // calculate ISKs here

        const itemIds: Array<number> = [details.victim.ship_type_id];

        for (const item of details.victim.items) {
          itemIds.push(item.item_type_id);

          // some have nested items
          if (item.items) {
            for (const nestedItem of item.items) {
              console.log(nestedItem.item_type_id);

              itemIds.push(nestedItem.item_type_id);
            }
          }
        }

        console.log(itemIds);

        const uniqueItemIds = [...new Set(itemIds)];

        const marketPrices = await Promise.all(
          uniqueItemIds.map((i) => fetchItemMarketPrice(i))
        );

        console.log(marketPrices.map((s) => s.currentPrice));

        let sumPrice = 0;
        for (const [i, itemId] of uniqueItemIds.entries()) {
          const itemRepeatedAmount = itemIds.filter((i) => i === itemId);
          console.log(`${itemId} came ${itemRepeatedAmount.length} times`);

          sumPrice +=
            itemRepeatedAmount.length * Number(marketPrices[i].currentPrice);
        }

        const nFormat = new Intl.NumberFormat("en-US");

        description += ` Total Value: ${nFormat.format(Number(sumPrice.toFixed()))} ISK`;

        description += `\n\n > ${details.attackers.length} player(s) were involved.`;

        const embed = new EmbedBuilder()
          .setTitle(`${victimDeatils} | ${victimShip.data.name} | Killmail`)
          .setURL(`https://zkillboard.com/kill/${killMail.killmail_id}/`)
          .setThumbnail(
            `${process.env.EVE_IMAGE_CDN_BASE_URL}/types/${details.victim.ship_type_id}/render?size=128`
          )
          .setColor(
            details.victim.corporation_id ===
              Number(process.env.EVE_CORPORATION_ID)
              ? "Red"
              : "Green"
          )
          .setDescription(description);

        if (channel?.isSendable()) await channel.send({ embeds: [embed] });

        oldKillMails.push(killMail);
      } catch (error) {
        console.log(error);
      }
    }

    console.log(
      `Next checking in ${(new Date(expires).getTime() - Date.now()) / 1000} seconds!`
    );

    setTimeout(
      () => {
        checkForNewKillMail(client);
      },
      new Date(expires).getTime() - Date.now() + 1000
    ); // added 1 second extra in case the cache isnt populated yet on the eve server
  } catch (error) {
    console.log(error);

    setTimeout(() => {
      checkForNewKillMail(client);
    }, 1000 * 10);
  }
}
