import {credential} from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {ActivityOptions, Client, GuildMember, TextChannel, User} from "discord.js";
import {ClonedMessage, CurrentUser} from "../@types";
import {ActivityTypes} from "discord.js/typings/enums";
import cert = credential.cert;

let db: FirebaseFirestore.Firestore;

export const formatEnvironmentVariable = (variable: string): string => {
    let output = variable.trim().replaceAll("\\n", "\n");
    const firstCharacter = output.charAt(0);
    const lastCharacter = output.charAt(output.length - 1);
    if (firstCharacter === "'" || firstCharacter === '"') {
        output = output.substring(1);
    }

    if (lastCharacter === "'" || lastCharacter === '"') {
        output = output.slice(0, -1);
    }

    return output;
};

export const initializeFirebase = () => {
    initializeApp({
        credential: cert({
            projectId: formatEnvironmentVariable(process.env.FIREBASE_PROJECT_ID as string),
            privateKey: formatEnvironmentVariable(process.env.FIREBASE_PRIVATE_KEY as string),
            clientEmail: formatEnvironmentVariable(process.env.FIREBASE_CLIENT_EMAIL as string),
        }),
    });

    db = getFirestore();
};

export const getCurrentUserDoc = async () => {
    try {
        return db.collection("userInfo").doc("current").get();
    }catch {
        return null;
    }
};

export const getCurrentUserId = async () => {
    try {
        const currentUserDoc = await getCurrentUserDoc();

        if(currentUserDoc?.exists) {
            const userData = currentUserDoc.data() as CurrentUser;
            return userData?.userId || null;
        }
    }catch {
        // Ignored
    }

    return null;
};

export const getCurrentUserMessage = async (messageId: string) => {
    const currentUserDoc = await getCurrentUserDoc();

    return currentUserDoc?.ref.collection("messages").doc(messageId).get();
};

export const saveClonedMessage = async (userMessageId: string, botMessageId: string, channelId: string) => {
    const currentUserDoc = (await getCurrentUserDoc())?.ref;

    if(currentUserDoc) {
        return currentUserDoc.collection("messages").doc(userMessageId).set({messageId: botMessageId, channelId});
    }

    return null;
};

export const cloneUserAvatar = async (client: Client, user: GuildMember | User) => {
    const avatarUrl = user.displayAvatarURL();
    if (client.user && avatarUrl) {
        try {
            await client.user.setAvatar(avatarUrl);
        }catch(e) {
            console.error(e);
        }
    }
};

export const cloneUserNickname = async (client: Client, user: GuildMember) => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID as string);

    if(guild.me) {
        await guild.me.setNickname(user.displayName);
    }
};

export const cloneUserName = async (client: Client, user: User) => {
    if(client.user) {
        try {
            await client.user.setUsername(user.username);
        }catch {
            console.error("Changing usernames too fast");
        }
    }
};

export const cloneUserPresence = async (client: Client, user: GuildMember) => {
    if (client.user && user?.presence) {
        const activities = user.presence.activities.map(
            (activity): ActivityOptions => ({
                ...activity,
                url: activity.url || undefined,
                type: activity.type === "CUSTOM" ? ActivityTypes.WATCHING : activity.type,
                name: (activity.type === "CUSTOM" ? activity.state ? ` @${user.displayName} ${activity.emoji && !activity.emoji.url ? activity.emoji.name : ""} ${activity.state}` : null : activity.name) || undefined
            }));

        await client.user.setPresence({
            status: user.presence.status === "offline" ? "idle" : user.presence.status,
            activities
        });
    }
};

export const cloneUserRoles = async (client: Client, user: GuildMember, oldUser?: GuildMember) => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID as string);

    if (guild.me) {
        const previousUser = oldUser || guild.me;

        const rolesToRemove = previousUser.roles.cache.filter((_, key) => !user.roles.cache.has(key));
        const rolesToAdd = user.roles.cache.filter((_, key) => !previousUser.roles.cache.has(key));

        try {
            rolesToRemove.delete(process.env.BOT_ROLE_ID as string);
            rolesToAdd.delete(process.env.BOT_ROLE_ID as string);

            await guild.me.roles.remove(rolesToRemove.map(role => role.id));
            await guild.me.roles.add(rolesToAdd.map(role => role.id));
        } catch (e) {
            console.error(e);
        }
    }
};

export const cloneUser = async (client: Client, user: GuildMember) => {
    const currentUserDoc = await getCurrentUserDoc();

    if(currentUserDoc?.exists) {
        const messages = await currentUserDoc.ref.collection("messages").get();

        for(const message of messages.docs) {
            const messageData = message.data() as ClonedMessage;

            const channel = await client.channels.fetch(messageData.channelId) as TextChannel;

            if(channel) {
                const botMessage = await channel.messages.fetch(messageData.messageId);

                if(botMessage) {
                    await botMessage.edit({ content: `${botMessage.content}\n\n*Sent as ${channel.guild.me!.nickname}*` });
                }
            }

            await message.ref.delete();
        }
    }

    if(process.env.GUILD_ID) {
        if (user && client.user) {
            await cloneUserPresence(client, user);
            await cloneUserAvatar(client, user);
            await cloneUserName(client, user.user);
            await cloneUserNickname(client, user);
            await cloneUserRoles(client, user);

            await db.collection("userInfo").doc("current").set({userId: user.id});
        }
    }
};
