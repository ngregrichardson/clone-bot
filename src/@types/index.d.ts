import {MessageAttachment, MessageEmbed, Sticker} from "discord.js";

interface CurrentUser {
    userId?: string;
}

interface ClonedMessage {
    messageId: string;
    channelId: string;
}

interface MessageContent {
    content: string,
    embeds?: MessageEmbed[],
    stickers?: Sticker[],
    files?: MessageAttachment[]
}
