// Nạp các biến môi trường từ tệp .env
require("dotenv").config();

const express = require("express");
const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const rga = require("random-gif-api");
const { message } = require("telegram/client");
const fs = require("fs");
const app = express();
// Định dạng
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

const botToken = process.env.BOT_TOKEN;
const serverURL = process.env.SERVER_URL;
const bot = new Telegraf(botToken);
console.log("Bot is running...");

const keyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "PokeyQuest 🐲",
          callback_data: "pokeyquest",
        },
        { text: "DuckCoop 🦆", callback_data: "duckcoop" },
        { text: "PirateFrenzy 🐳", callback_data: "frenzy" },
      ],
      [
        {
          text: "Văn mẫu BD",
          callback_data: "bd",
        },
      ],
    ],
  },
};

// Đường dẫn tệp lưu trữ user ID
const usersFilePath = "users.json";

// Đọc danh sách User ID từ tệp
const readUserIds = () => {
  if (fs.existsSync(usersFilePath)) {
    return JSON.parse(fs.readFileSync(usersFilePath));
  }
  return [];
};

// Ghi danh sách User ID vào tệp
const writeUserIds = (userIds) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(userIds));
};

bot.start((ctx) => {
  const userId = ctx.chat.id;
  let userIds = readUserIds();
  if (!userIds.includes(userId)) {
    userIds.push(userId);
    writeUserIds(userIds);
  }
  ctx.replyWithPhoto(
    {
      url: "https://png.pngtree.com/thumb_back/fw800/background/20230610/pngtree-anime-anime-girl-by-kyuuya-yoshito-and-her-three-friends-image_2951481.jpg",
    },
    {
      caption:
        "Welcome to Susy's bot! 🌸\n\nWe're thrilled to have you here\nFree version is released now!\n\nCheck your referral code hear 👇👇👇",
      reply_markup: keyboard.reply_markup,
    }
  );
});
// Ví dụ gửi thông báo khi bot nhận lệnh /notify
bot.command("notify", (ctx) => {
  const message = "This is a notification to all users!";
  sendNotificationToAllUsers(message);
  ctx.reply("Notification sent to all users.");
});

bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.hears("help", (ctx) => {
  ctx.reply("Send me a sticker");
});

let duckcoopKeywordRequest = false;
let pokeyquestKeywordRequest = false;
let frenzyKeywordRequest = false;

// BD action
const exm1 = `Your Benefits:

1. We have a private pool specifically for KOLs. We will give you the allocation of 0,1% of total supply, equivalent to $1,000 when our Market cap reaches 1M. As a guarantee, if our MC can't reach 1M within 3 weeks, we will compensate you $1,000 in fiat

2. Your Twitter will be featured in our bot as our Ambassador, boosting your social presence. We guarantee that you'll gain 10k followers within 24 hours.

3. We will also send you 500,000 $DUCKS as an additional incentives. Currently we are working with top-tier CEXs to prepare listing plan. We've already announced about our partnership with Gate, MEXC, OKX and Bitget
At the moment, $DUCKS can be used to participate in Launch pool and staked for $DUMP - an already listed token in our ecosystem.

Our Requirements:

You have to stick with the project and our content plan. Including: 3 posts + 4 RT + 3 QT per month
First, in this week, we need:
- 1 intro post about the project which educate new users to our app
- 2 QT about the updating features of project
- 1 call post when listing (the listing is scheduled for next week)`;

const exm2 = `About DuckCoop:
:duck: $DUCKS - Just a funny meme to give a quacking shoutout to Telegram flock. Airdrop incoming for all Telegram duckies! :parachute:
• Total Users: 3.9M+
• Daily Active Users (DAU): 800K+
• Channel Subscribers: 1.9M+
• Telegram Channel: https://t.me/duckcoopchannel
• Bot: https://t.me/duckscoop_bot
• Twitter: https://x.com/DuckCoop_TG`;

const example = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Văn mẫu DuckCoop",
          callback_data: "duck_bd",
        },
      ],
    ],
  },
};

bot.action("bd", (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithPhoto(
    {
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVdVF09toliZ663zV_J0CTRfTn99LKLgAW4g&s",
    },
    {
      caption: "Lựa chọn văn mẫu 👇",
      reply_markup: example.reply_markup,
    }
  );
});

const duck_bd = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Introduction",
          callback_data: "duck_bd_intro",
        },
      ],
      [
        {
          text: "Ambassador",
          callback_data: "duck_bd_amb",
        },
      ],
    ],
  },
};

bot.action("duck_bd", (ctx) => {
  ctx.answerCbQuery();
  ctx.replyWithPhoto(
    {
      url: "https://airdropalert.com/wp-content/uploads/2024/07/Duck-Airdrop.jpeg",
    },
    {
      caption: "Lựa đê",
      reply_markup: duck_bd.reply_markup,
    }
  );
});

bot.action("duck_bd_intro", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(exm2);
});
bot.action("duck_bd_amb", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(exm1);
});

// Referral Action
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
          url: "https://images.alphacoders.com/134/thumb-1920-1345286.png",
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
          url: "https://img.freepik.com/premium-photo/anime-girl-standing-water-with-fish-fish-background-generative-ai_958165-27986.jpg",
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
