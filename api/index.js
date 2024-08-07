// Nạp các biến môi trường từ tệp .env
require("dotenv").config();

const express = require("express");
const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const rga = require("random-gif-api");
const { message } = require("telegram/client");
const app = express();
// Định dạng
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

const botToken = process.env.BOT_TOKEN; // Thay thế bằng token của bạn
const serverURL = process.env.SERVER_URL;
const bot = new Telegraf(botToken);
console.log("Bot is running...");

const keyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Check PokeyQuest Referral 🐲",
          callback_data: "pokeyquest",
        },
        { text: "Check DuckCoop Referral 🦆", callback_data: "duckcoop" },
      ],
      [{ text: "Check PirateFrenzy Referral 🐳", callback_data: "frenzy" }],
    ],
  },
};

bot.start((ctx) => {
  ctx.replyWithPhoto(
    {
      url: "https://png.pngtree.com/thumb_back/fw800/background/20230610/pngtree-anime-anime-girl-by-kyuuya-yoshito-and-her-three-friends-image_2951481.jpg",
    },
    {
      caption:
        "Welcome to Susy's bot! 🌸\n\nWe're thrilled to have you here. Click the buttons below to start exploring right away.\n\nHave a wonderful time with Susy's bot! 😊",
      reply_markup: keyboard.reply_markup,
    }
  );
});

bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.hears("help", (ctx) => {
  ctx.reply("Send me a sticker");
});

let duckcoopKeywordRequest = false;
let pokeyquestKeywordRequest = false;
let frenzyKeywordRequest = false;

bot.action("duckcoop", (ctx) => {
  ctx.answerCbQuery();
  duckcoopKeywordRequest = true;
  pokeyquestKeywordRequest = false; // Ensure only one request type is active
  ctx.reply("Please enter the DuckCoop referral code:");
});

bot.action("pokeyquest", (ctx) => {
  ctx.answerCbQuery();
  pokeyquestKeywordRequest = true;
  duckcoopKeywordRequest = false; // Ensure only one request type is active
  ctx.reply("Please enter the PokeyQuest referral code:");
});

bot.action("frenzy", (ctx) => {
  ctx.answerCbQuery();
  pokeyquestKeywordRequest = false;
  duckcoopKeywordRequest = false; // Ensure only one request type is active
  frenzyKeywordRequest = true;
  ctx.reply("Please enter the PirateFrenzy referral code:");
});

bot.on("text", async (ctx) => {
  if (duckcoopKeywordRequest) {
    const url = `https://api.duckcoop.xyz/user/get-ref-count?ref_code[]=${ctx.message.text}`;

    duckcoopKeywordRequest = false;
    try {
      const data = await fetch(url);
      const result = await data.json();
      const message = `👤 User_name: ${result.data[0].full_name}\n\n🃏 Total_Ref: ${result.data[0].total_ref}`;
      ctx.replyWithPhoto(
        {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_Id2yspKq-rr6CQ_G8Sl60rmUI5s55SA9nA&s",
        },
        {
          caption: message,
          reply_markup: keyboard.reply_markup,
        }
      );
    } catch (error) {
      console.log(error);
      ctx.reply("Sorry, an error occurred while fetching the referral data.");
    }
  } else if (pokeyquestKeywordRequest) {
    const url = "https://api.pokey.quest/user/check-ref-kol";
    const config = {
      method: "POST",
      headers: {
        Authorization: process.env.KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ link_ref: [ctx.message.text] }),
    };
    pokeyquestKeywordRequest = false;

    try {
      const data = await fetch(url, config);
      const result = await data.json();
      const message = `👤 User_name: ${result.data[0].username}\n\n🃏 Total_Referral: ${result.data[0].total_ref}`;
      ctx.replyWithPhoto(
        {
          url: "https://cdn.popsww.com/blog-kids/sites/3/2021/09/cac-pokemon-cua-satoshi.jpg",
        },
        {
          caption: message,
          reply_markup: keyboard.reply_markup,
        }
      );
    } catch (error) {
      console.log(error);
      ctx.reply("Sorry, an error occurred while fetching the referral data.");
    }
  } else if (frenzyKeywordRequest) {
    const url = `https://api-minigame-prod.piratebattle.xyz/user/get-ref-count?ref_code[]=${ctx.message.text}`;
    frenzyKeywordRequest = false;
    try {
      const data = await fetch(url);
      const result = await data.json();
      const message = `👤 User_name: ${result.data[0].full_name}\n\n🃏 Total_Ref: ${result.data[0].total_ref}`;
      ctx.replyWithPhoto(
        {
          url: "https://pbs.twimg.com/media/GTJU09aaIAAk1gI?format=jpg&name=large",
        },
        {
          caption: message,
          reply_markup: keyboard.reply_markup,
        }
      );
    } catch (error) {
      console.log(error);
      ctx.reply("Sorry, an error occurred while fetching the referral data.");
    }
  }
});

const setWebhook = async () => {
  const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${serverURL}`;
  try {
    const response = await axios.get(url);
    console.log("Webhook set:", response.data);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
};

setWebhook();
console.log("Webhook ready....");

app.post("/", (req, res) => {
  bot.handleUpdate(req.body, res);
});

bot.launch();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("BOT IS READY!");
