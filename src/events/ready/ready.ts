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

        if (details.attackers[0].character_id) {
          const promises = [];
          promises.push(
            fetchCharacterDetails(details.attackers[0].character_id),
            fetchCorportationDetails(details.attackers[0].corporation_id!),
            fetchShipDetails(details.attackers[0].ship_type_id)
          );
          const [attackerCh, attackerCp, attackerShip] =
            await Promise.all(promises);

          description += `  Final Blow by ${attackerCh.data.name} (${attackerCp.data.name}) flying in a ${attackerShip.data.name}.`;
        }

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
