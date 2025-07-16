const { Telegraf, Markup } = require('telegraf');
const gTTS = require('node-gtts')('en');
const streamifier = require('streamifier');
require('dotenv').config();
const fs = require('fs');

const bot = new Telegraf(process.env.bot_token);

bot.start((ctx) => {
    ctx.reply(`Salom✋, ${ctx.from.first_name}! Menga ingliz tilida TEXT yuboring men uni AUDIO ko'rinishiga o'tkazib beraman👌 ingliz tilida bo'sa yaxshiroq.`);
    const bor = fs.existsSync('users.txt');
    if (bor == true) {
        const marn = fs.readFileSync('users.txt', 'utf-8');
        const idbor = marn.includes(ctx.from.id.toString());
        if (idbor == false) {
            fs.appendFileSync('users.txt', ctx.from.id.toString() + '\n', 'utf-8');
        }
    }
});

bot.on('text', async (ctx) => {
    const member = await ctx.telegram.getChatMember('@video_1110', ctx.from.id);
    if (member.status == 'left') {
        return ctx.reply('siz hali video_1110 botga azo bolmagansiz!!!',
            Markup.inlineKeyboard([
                Markup.button.url('obuna', 'https://t.me/video_1110')
            ])
        );
    }

    const textMsg = ctx.message;
    const text = textMsg.text;
    const chatId = textMsg.chat.id;
    const textMsgId = textMsg.message_id;

    const chunks = [];
    const stream = gTTS.stream(text);

    stream.on('data', (chunk) => chunks.push(chunk));

    stream.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        try {
            const audioMsg = await ctx.replyWithAudio({
                source: streamifier.createReadStream(buffer),
                filename: 'voice.mp3'
            });

            const audioMsgId = audioMsg.message_id;

            setTimeout(() => {
                bot.telegram.deleteMessage(chatId, textMsgId).catch(err => console.log('Matnni o‘chirishda xatolik:', err));
                bot.telegram.deleteMessage(chatId, audioMsgId).catch(err => console.log('Audio o‘chirishda xatolik:', err));
            }, 60 * 60 * 1000);

        } catch (err) {
            console.error('Yuborishda xatolik:', err);
            ctx.reply('Xatolik yuz berdi.');
        }
    });

    stream.on('error', (err) => {
        console.error('Audio yaratishda xatolik:', err);
        ctx.reply('Audio yaratishda xatolik yuz berdi.');
    });
});

bot.launch();
























