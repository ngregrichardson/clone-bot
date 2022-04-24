import fs from "fs";
import { join } from "path";
import { Client } from "discord.js";

const registerEvents = (client: Client, path = "../events") => {
    const eventFiles = fs
        .readdirSync(join(__dirname, path))
        .filter((file) => file.endsWith(".ts") || file.endsWith("js"));

    for (const file of eventFiles) {
        const { default: event } = require(join(path, file));

        let names = [];

        if (Array.isArray(event.name)) {
            names = event.name;
        } else {
            names = [event.name];
        }

        names.forEach((name: string) => {
            if (event.once) {
                client.once(name, (...args) => event.execute(client, ...args));
            } else {
                client.on(name, (...args) => event.execute(client, ...args));
            }
        });
    }
};

export default registerEvents;
