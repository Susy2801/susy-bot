require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const botToken = process.env.BOT_TOKEN;

const bot = new Telegraf(botToken);
console.log("Bot is running...");

// Định nghĩa keyboard
const keyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "DuckCoop 🦆", callback_data: "duckcoopAll" },
        { text: "Duck by Date 🦆", callback_data: "duckcoop" },
      ],
      [{ text: "Nature Duck 🍃 ", callback_data: "duckcoopNature" }],
      [{ text: "🔞 Duck for real 🔞", callback_data: "realDuck" }],
      [{ text: "Pirate Frenzy 🐳", callback_data: "frenzy" }],
      [{ text: "MonkeyPaw 🐵", callback_data: "monkeypaw" }],
    ],
  },
};

// Kiểm tra định dạng ngày dd/mm/yyyy
const isValidDate = (dateString) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateString.match(regex)) return false;

  const [day, month, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  return !isNaN(date.getTime());
};

// Chuyển đổi từ dd/mm/yyyy sang định dạng ISO (yyyy-mm-ddTHH:MM:SSZ)
const convertToISODateTime = (dateString, timeString) => {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}T${timeString}:00Z`; // Thêm giây và ký tự Z để đại diện cho UTC
};

// Biến trạng thái cho từng loại yêu cầu
let currentRequest = {
  type: "",
  referralCode: "",
  fromDate: "",
  toDate: "",
};

// Reset yêu cầu
const resetCurrentRequest = () => {
  currentRequest = {
    type: "",
    referralCode: "",
    fromDate: "",
    toDate: "",
  };
};

// Khởi động bot
bot.start((ctx) => {
  ctx.replyWithPhoto(
    {
      url: "https://png.pngtree.com/thumb_back/fw800/background/20230610/pngtree-anime-anime-girl-by-kyuuya-yoshito-and-her-three-friends-image_2951481.jpg",
    },
    {
      caption:
        "Welcome to Susy's bot! 🌸\n\nWe're thrilled to have you here.\nFree version is released now!\n\nCheck your referral code here 👇👇👇",
      reply_markup: keyboard.reply_markup,
    }
  );
});

// Xử lý các yêu cầu referral
const handleNature = async (ctx, url, loadingMessage, Date) => {
  try {
    const response = await axios.get(url);
    const data = response.data.data;

    const message = `Nature Ducks 🍃\nFrom *_${Date.fromDate}_* to *_${Date.toDate}_*\n\nTotal Nature Ref: *${data.total_ref}*`;

    ctx.deleteMessage(loadingMessage.message_id); // Xóa tin nhắn "Loading..."
    ctx.replyWithPhoto(
      {
        url: "https://lh5.googleusercontent.com/proxy/CXarQ2ENmcaFlVxzmveQw2afz-8v0JQ9ekJ59QLwR7wM16P2LpJCaXHdL11kP9Pyx2miKyziegmfT6XLloaxo4XzcJb2obLoHjx_mEiHotJFzjYT",
      },
      {
        caption: message,
        reply_markup: keyboard.reply_markup,
        parse_mode: "MarkdownV2",
      }
    );
    // Reset trạng thái sau khi xử lý xong
    resetCurrentRequest();
  } catch (error) {
    console.log(error);
    ctx.deleteMessage(loadingMessage.message_id);
    ctx.reply("Sorry, an error occurred while fetching the referral data.");
    resetCurrentRequest();
  }
};

// Xử lý các yêu cầu referral
const handleReferral = async (ctx, url, loadingMessage, Date) => {
  try {
    const response = await axios.get(url);
    const data = response.data.data[0];

    if (!data || data.length === 0) {
      ctx.reply("No data found for the given referral code.");
      ctx.deleteMessage(loadingMessage.message_id);
      return;
    }

    // Sử dụng map để xử lý từng mục dữ liệu
    data.map((item, index) => {
      if (index === 0) {
        const message = `From ${Date.fromDate} to ${Date.toDate}\n\n👤 User_name: ${item.full_name}\n\n🃏 Total_Ref: ${item.total_ref}`;

        ctx.deleteMessage(loadingMessage.message_id); // Xóa tin nhắn "Loading..."
        ctx.replyWithPhoto(
          {
            url: "https://nudevn.com/wp-content/uploads/2024/07/veronica-lucifer_0029-1-FILEminimizer.jpg",
          },
          {
            caption: message,
            reply_markup: keyboard.reply_markup,
          }
        );
      }
    });

    // Reset trạng thái sau khi xử lý xong
    resetCurrentRequest();
  } catch (error) {
    console.log(error);
    ctx.deleteMessage(loadingMessage.message_id);
    ctx.reply("Sorry, an error occurred while fetching the referral data.");
    resetCurrentRequest();
  }
};
// Xử lí theo case
let duckcoopAll = false;
let duckcoopByDate = false;
let frenzy = false;
let realDuck = false;
let duckcoopNature = false;
let monkeyPaw = false;

// Các hành động xử lý yêu cầu từ người dùng
const handleActions = (type, ctx) => {
  currentRequest.type = type;
  if (duckcoopNature) {
    ctx.reply(`Send "ok" to continue`);
  } else {
    ctx.reply(`Please enter the ${type} referral code:`);
  }
};

// Hành động tương ứng với mỗi lựa chọn
bot.action("duckcoopAll", (ctx) => {
  handleActions("DuckCoop", ctx);
  duckcoopAll = true;
  duckcoopByDate = false;
});
bot.action("duckcoop", (ctx) => {
  handleActions("DuckCoop", ctx);
  duckcoopByDate = true;
  duckcoopAll = false;
});
bot.action("frenzy", (ctx) => {
  handleActions("PirateFrenzy", ctx);
  frenzy = true;
  duckcoopByDate = false;
  duckcoopAll = false;
});
bot.action("realDuck", (ctx) => {
  handleActions("Real Duck", ctx);
  frenzy = false;
  duckcoopByDate = false;
  duckcoopAll = false;
  realDuck = true;
});
bot.action("duckcoopNature", (ctx) => {
  frenzy = false;
  duckcoopByDate = false;
  duckcoopAll = false;
  realDuck = false;
  duckcoopNature = true;
  handleActions("Nature Duck", ctx);
});
bot.action("monkeypaw", (ctx) => {
  frenzy = false;
  duckcoopByDate = false;
  duckcoopAll = false;
  realDuck = false;
  duckcoopNature = false;
  monkeyPaw = true;
  handleActions("MonkeyPaw", ctx);
});

// Lệnh reset để hủy yêu cầu đang nhập dở
bot.command("reset", (ctx) => {
  resetCurrentRequest();
  ctx.reply("Your request has been reset and cancelled.");
});

// Xử lý đầu vào từ người dùng
bot.on("text", async (ctx) => {
  const input = ctx.message.text;
  if (duckcoopByDate) {
    if (!currentRequest.referralCode) {
      currentRequest.referralCode = input;
      ctx.reply("Please enter the start date (fromDate) in format dd/mm/yyyy:");
    } else if (!currentRequest.fromDate) {
      if (!isValidDate(input)) {
        return ctx.reply(
          "Invalid date format! Please enter the start date in format dd/mm/yyyy:"
        );
      }
      currentRequest.fromDate = input;
      ctx.reply("Please enter the end date (toDate) in format dd/mm/yyyy:");
    } else if (!currentRequest.toDate) {
      if (!isValidDate(input)) {
        return ctx.reply(
          "Invalid date format! Please enter the end date in format dd/mm/yyyy:"
        );
      }
      currentRequest.toDate = input;

      // Chuyển đổi định dạng ngày giờ sang ISO UTC
      const fromDateTime = convertToISODateTime(
        currentRequest.fromDate,
        "00:00"
      ); // Bắt đầu là 00:00
      const toDateTime = convertToISODateTime(currentRequest.toDate, "23:59"); // Kết thúc là 23:59
      const Date = {
        fromDate: currentRequest.fromDate,
        toDate: currentRequest.toDate,
      };

      const url = `https://api.apiduck.xyz/user/get-ref-count?ref_code[]=${currentRequest.referralCode}&fromDate=${fromDateTime}&toDate=${toDateTime}`;

      // Gửi tin nhắn "Loading..." trước khi gửi API đi
      const loadingMessage = await ctx.reply("Loading, please wait...");

      // Thêm trạng thái typing (tùy chọn)
      await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

      // Gửi API và xử lý kết quả
      handleReferral(ctx, url, loadingMessage, Date);
    }
  } else if (duckcoopAll) {
    const url = `https://api.apiduck.xyz/user/get-ref-count?ref_code[]=${input}`;
    try {
      const response = await axios.get(url);
      const data = response.data.data[0];

      if (!data || data.length === 0) {
        return ctx.reply("No data found for the given referral code.");
      }

      // Sử dụng map để xử lý từng mục dữ liệu
      data.map((item, index) => {
        if (index === 0) {
          const message = `👤 User_name: ${item.full_name}\n\n🃏 Total_Ref: ${item.total_ref}`;
          ctx.replyWithPhoto(
            {
              url: "https://images.alphacoders.com/134/thumb-1920-1345286.png",
            },
            {
              caption: message,
              reply_markup: keyboard.reply_markup,
            }
          );
        }
      });
    } catch (error) {
      console.log(error);
      ctx.reply("Sorry, an error occurred while fetching the referral data.");
    }
  } else if (frenzy) {
    const url = `https://api-minigame-prod.piratebattle.xyz/user/get-ref-count?ref_code[]=${ctx.message.text}`;
    frenzy = false;
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
  } else if (realDuck) {
    const url = `https://api.apiduck.xyz/statistics/count-partner-ref?ref_code[]=${ctx.message.text}`;
    realDuck = false;
    try {
      const data = await fetch(url);
      const result = await data.json();
      const message = `👤 User_ref: ${result.data[0].ref_code}\n\n🃏 Total_Child: ${result.data[0].total_child}`;
      ctx.replyWithPhoto(
        {
          url: "https://teletiengviet.com/wp-content/uploads/2023/11/Bo-suu-tap-99-anh-Khuc-Thi-Huong-khoe-vu-khung-goi-duc-kho-cuong-4.png",
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
  } else if (duckcoopNature) {
    if (!currentRequest.referralCode) {
      currentRequest.referralCode = input;
      ctx.reply("Please enter the start date (fromDate) in format dd/mm/yyyy:");
    } else if (!currentRequest.fromDate) {
      if (!isValidDate(input)) {
        return ctx.reply(
          "Invalid date format! Please enter the start date in format dd/mm/yyyy:"
        );
      }
      currentRequest.fromDate = input;
      ctx.reply("Please enter the end date (toDate) in format dd/mm/yyyy:");
    } else if (!currentRequest.toDate) {
      if (!isValidDate(input)) {
        return ctx.reply(
          "Invalid date format! Please enter the end date in format dd/mm/yyyy:"
        );
      }
      currentRequest.toDate = input;

      // Chuyển đổi định dạng ngày giờ sang ISO UTC
      const fromDateTime = convertToISODateTime(
        currentRequest.fromDate,
        "00:00"
      ); // Bắt đầu là 00:00
      const toDateTime = convertToISODateTime(currentRequest.toDate, "23:59"); // Kết thúc là 23:59
      const Date = {
        fromDate: currentRequest.fromDate,
        toDate: currentRequest.toDate,
      };

      const url = `https://api.apiduck.xyz/user/get-ref-count?ref_code[]=&fromDate=${fromDateTime}&toDate=${toDateTime}`;

      // Gửi tin nhắn "Loading..." trước khi gửi API đi
      const loadingMessage = await ctx.reply("Loading, please wait...");

      // Thêm trạng thái typing (tùy chọn)
      await ctx.telegram.sendChatAction(ctx.chat.id, "typing");

      // Gửi API và xử lý kết quả
      handleNature(ctx, url, loadingMessage, Date);
    }
  } else if (monkeyPaw) {
    const url = `https://api.monkeypaw.xyz/user/get-ref-count?ref_code[]=${ctx.message.text}`;
    monkeyPaw = false;
    try {
      const response = await fetch(url);
      const datas = await response.json();
      const data = datas.data[0];
      if (!data || data.length === 0) {
        return ctx.reply("No data found for the given referral code.");
      }

      // Sử dụng map để xử lý từng mục dữ liệu
      data.map((item, index) => {
        if (index === 0) {
          const message = `👤 User_name: ${item.full_name}\n\n🃏 Total_Ref: ${item.total_ref}`;
          ctx.replyWithPhoto(
            {
              url: "https://wallpapercg.com/media/ts_orig/25790.webp",
            },
            {
              caption: message,
              reply_markup: keyboard.reply_markup,
            }
          );
        }
      });
    } catch (error) {
      console.log(error);
      ctx.reply("Sorry, an error occurred while fetching the referral data.");
    }
  }
});

bot.launch();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
