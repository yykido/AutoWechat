import { WechatyBuilder, log, ScanStatus } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wechaty = WechatyBuilder.build();
const allowedContacts = []; // Specify allowed contacts here

async function getChatGPTReply(message) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    log.error('ChatGPT API request failed:', error);
    return "Sorry, I couldn't generate a response at this time.";
  }
}

function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrcodeTerminal.generate(qrcode, { small: true });
    console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`);
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status);
  }
}

function onLogin(user) {
  log.info('StarterBot', '%s logged in', user);
}

function onLogout(user) {
  log.info('StarterBot', '%s logged out', user);
}

async function onMessage(msg) {
  log.info('StarterBot', 'Message: %s', msg);

  if (msg.self()) {
    return;
  }

  const from = msg.from();
  const contactName = from.name();
  const room = msg.room();

  // Ignore messages from group chats
  if (room) {
    log.info('Message', `Ignoring message from room: ${room.topic()}`);
    return;
  }

  if (allowedContacts.includes(contactName)) {
    if (msg.type() === wechaty.Message.Type.Text) {
      const text = msg.text();
      log.info('Message', `Contact: ${from.name()} Text: ${text}`);
      const reply = await getChatGPTReply(text);
      msg.say(reply);
    }
  } else {
    log.info('StarterBot', `Message from ${contactName} is ignored.`);
  }
}

wechaty
  .on('scan', onScan)
  .on('login', onLogin)
  .on('logout', onLogout)
  .on('message', onMessage);

wechaty.start()
  .catch(e => console.error('Bot start failed:', e));
