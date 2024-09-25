require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const botToken = "6333064218:AAGDsqP8nsHJMDjS7H4B_AIxFZCFfpQVPww";
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
      [{ text: "Pirate Frenzy 🐳", callback_data: "frenzy" }],
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
            url: "https://images.alphacoders.com/134/thumb-1920-1345286.png",
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

// Các hành động xử lý yêu cầu từ người dùng
const handleActions = (type, ctx) => {
  currentRequest.type = type;
  ctx.reply(`Please enter the ${type} referral code:`);
};

// Xử lí theo case
let duckcoopAll = false;
let duckcoopByDate = false;
let frenzy = false;

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
  }
});

// Khởi động server
bot.launch();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
