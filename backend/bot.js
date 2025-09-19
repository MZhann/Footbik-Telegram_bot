require("dotenv").config({
  path: [".env.local", ".env"],
  override: true,
});

const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");
const Poll = require("./src/models/Poll");

const { BOT_TOKEN, MONGO_URL } = process.env;
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN missing");
  process.exit(1);
}
if (!MONGO_URL) {
  console.error("❌ MONGO_URL missing");
  process.exit(1);
}

(async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Mongo connected for bot");

  const bot = new TelegramBot(BOT_TOKEN, { polling: true });
  console.log("🤖 Polling Bot is working");

  function escapeHtml(s = "") {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  async function safeSendMessage(chatId, text, options = {}) {
    try {
      return await bot.sendMessage(chatId, text, options);
    } catch (err) {
      console.error("sendMessage failed:", err?.response?.body || err);
      // fallback: уберём HTML-теги и отправим "plain"
      const plain = String(text).replace(/<[^>]+>/g, "");
      return await bot.sendMessage(chatId, plain);
    }
  }

  // /create_poll футбик завтра в 9
  const CMD = /^\/create_poll(?:@[\w_]+)?\s+([\s\S]+)$/i;
  const CLOSE_CMD = /^\/close_poll(?:@[\w_]+)?\s*$/i;
  // const INFO_CMD =
  //   /^\/poll_info(?:@[\w_]+)?(?:\s+(последний|прежний|last|previous))?\s*$/i;
  const INFO_CMD = /^\/poll_info(?:@[\w_]+)?(?:\s+([\s\S]+))?$/i;
  // Начинает полл
  bot.onText(CMD, async (msg, match) => {
    const chatId = msg.chat.id;
    const title = (match?.[1] || "").trim();
    if (!title) {
      await safeSendMessage(
        chatId,
        "Usage: <code>/create_poll &lt;text&gt;</code>",
        {
          parse_mode: "HTML",
        }
      );
      return;
    }

    // 1) удаляем команду
    try {
      await bot.deleteMessage(chatId, msg.message_id);
    } catch (_) {}

    // 2) создаём НАТИВНЫЙ опрос
    const options = ["✅ Участвую", "❌ Не участвую"];
    const sent = await bot.sendPoll(chatId, title, options, {
      is_anonymous: false,
      allows_multiple_answers: false,
    });

    // 3) сохраняем в БД "паспорт" опроса
    const creator = {
      id: String(msg.from.id),
      username: msg.from.username || null,
      name: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(" "),
    };

    await Poll.create({
      chatId: String(chatId),
      messageId: sent.message_id,
      pollId: sent.poll.id, // важный ключ для последующих апдейтов
      title,
      options: [
        { id: 0, text: options[0] },
        { id: 1, text: options[1] },
      ],
      createdBy: creator,
    });
  });

  //завершает полл
  bot.onText(CLOSE_CMD, async (msg) => {
    const chatId = msg.chat.id;

    // берём последний опрос в этом чате
    const doc = await Poll.findOne({ chatId: String(chatId) }).sort({
      createdAt: -1,
      _id: -1,
    });

    if (!doc) {
      await safeSendMessage(chatId, "Опрос не найден.");
      return;
    }

    try {
      // Закрываем нативный опрос
      const res = await bot.stopPoll(chatId, doc.messageId);
      // пометим в БД
      doc.closedAt = new Date();
      await doc.save();

      await safeSendMessage(
        chatId,
        `<b>Опрос закрыт:</b> "${escapeHtml(doc.title)}"<br/>Итоги: ${
          res.total_voter_count
        } голос(ов).`,
        { parse_mode: "HTML" }
      );
    } catch (e) {
      await bot.sendMessage(
        chatId,
        "Не удалось закрыть опрос (возможно, уже закрыт)."
      );
    }
  });

  //показывает инфу о полле в зависимости от текста "последний" и "прежний"
  bot.onText(INFO_CMD, async (msg, match) => {
    const chatId = msg.chat.id;

    // Аргумент после команды: нормализуем пробелы и регистр
    const argRaw = (match && match[1] ? match[1] : "").trim();
    const arg = argRaw.replace(/\s+/g, " ").toLowerCase();

    // 3) Определяем, какой опрос брать:
    // - по умолчанию: последний (offset=0)
    // - “прежний”, “предыдущий”, “prev”, “previous” => offset=1
    const isPrevious =
      arg.startsWith("преж") ||
      arg.startsWith("пред") ||
      arg.startsWith("prev");
    const offset = isPrevious ? 1 : 0;

    // 4) Достаём нужный Poll из БД
    const docs = await Poll.find({ chatId: String(chatId) })
      .sort({ createdAt: -1, _id: -1 })
      .skip(offset)
      .limit(1);

    const doc = docs[0];
    if (!doc) {
      await safeSendMessage(
        chatId,
        isPrevious
          ? "Предыдущий опрос не найден."
          : "Последний опрос не найден."
      );
      return;
    }

    // 5) Формируем списки
    const join = (doc.votes || []).filter((v) => v.choice === "join");
    const decline = (doc.votes || []).filter((v) => v.choice === "decline");

    const toLabel = (v) => {
      // const raw = v?.username ? `@${v.username}` : v?.name || `id:${v?.id}`;
      const raw = v?.username ? `${v.username}` : v?.name || `id:${v?.id}`;
      return escapeHtml(raw); // мы уже на HTML parse_mode
    };
    const list = (arr) =>
      arr.length ? arr.map((v) => `- ${toLabel(v)}`).join("\n") : "-";

    const text =
      `<b>Опрос:</b> ${escapeHtml(doc.title)}\n` +
      `<b>Статус:</b> ${doc.closedAt ? "закрыт" : "открыт"}\n` +
      `<b>✅ Участвуют</b> (${join.length}):\n${list(join)}\n\n` +
      `<b>❌ Не участвуют</b> (${decline.length}):\n${list(decline)}`;

    await safeSendMessage(chatId, text, { parse_mode: "HTML" });
  });

  // 4) фиксация КАЖДОГО голосования / отмены
  bot.on("poll_answer", async (answer) => {
    const { poll_id, user, option_ids } = answer;
    const poll = await Poll.findOne({ pollId: poll_id });
    if (!poll) return;

    // Определяем выбор: 0 -> join, 1 -> decline, [] -> отмена голоса
    let choice = null;
    if (Array.isArray(option_ids) && option_ids.length > 0) {
      choice = option_ids[0] === 0 ? "join" : "decline";
    }

    const voterId = String(user.id);
    const username = user.username || null;
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

    // Обновляем/добавляем запись о голосе
    const idx = poll.votes.findIndex((v) => v.id === voterId);
    if (idx >= 0) {
      poll.votes[idx].username = username;
      poll.votes[idx].name = name;
      poll.votes[idx].choice = choice; // null -> снял голос
      poll.votes[idx].updatedAt = new Date();
    } else {
      poll.votes.push({
        id: voterId,
        username,
        name,
        choice,
        updatedAt: new Date(),
      });
    }
    await poll.save();
  });
})();
