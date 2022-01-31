import { changeToRandomUser, getCurrentUserId } from "../utils/user";
import { Client } from "../utils/definitions";
import { CronJob } from "cron";

const execute = async (client: Client) => {
  console.log("Bot online.");
  const job = new CronJob(
    "0 0 0 * * *",
    () => changeToRandomUser(client),
    null,
    (await getCurrentUserId()) !== null,
    "America/New_York"
  );
  job.start();

  client.guilds.cache.get("").commands?.set();
};

export default {
  name: "ready",
  once: true,
  execute,
};
