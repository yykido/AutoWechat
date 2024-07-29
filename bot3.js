import { WechatyBuilder, log, ScanStatus } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wechaty = WechatyBuilder.build();
const allowedContacts = ['叶建平','庆菊','Evie💫']; // Specify allowed contacts here
const userConversations = {}; // Store user conversations here

async function getChatGPTReply(user, message) {
  try {
    // Initialize conversation for the user if not already present
    if (!userConversations[user]) {
      userConversations[user] = [{ role: "system", content: "You are a helpful assistant." }];
    }

    // Add the new user message to the conversation
    userConversations[user].push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: userConversations[user],
    });

    const reply = completion.choices[0].message.content.trim();

    // Add the assistant's reply to the conversation
    userConversations[user].push({ role: "assistant", content: reply });

    return reply;
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

async function handleVoiceMessage(msg) {
  // TODO: Add your voice message handling logic here
  log.info('Voice message received from', msg.from().name());
  msg.say("语音消息已收到，但目前不支持语音处理。");
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
    switch (msg.type()) {
      case wechaty.Message.Type.Text:
        const text = msg.text();
        log.info('Message', `Contact: ${from.name()} Text: ${text}`);
        if (text === "结束对话" && userConversations[contactName]) {
          userConversations[contactName] = [{ role: "system", content: "You are a helpful assistant." }];
          log.info('Message', `Chat already finished`);
          msg.say("对话已结束");
        } else {
          const reply = await getChatGPTReply(contactName, text);
          msg.say(reply);
        }
        break;
      case wechaty.Message.Type.Audio:
        await handleVoiceMessage(msg);
        break;
      // Add more cases to handle other message types if needed
      default:
        log.info('Message', `Unhandled message type: ${msg.type()}`);
        break;
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


/**
 *
 *  Output the Welcome Message
 *
 */
const welcome = `
| __        __        _           _
| \\ \\      / /__  ___| |__   __ _| |_ _   _
|  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
|   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
|    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
|                                     |___/

=============== Powered by Wechaty ===============
-------- https://github.com/chatie/wechaty --------
          Version: ${wechaty.version(true)}

I'm a bot, my superpower is assisting you thanks to the OPENAI. 

You can ask me any questions you want
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me to more superpowers!

Please wait... I'm trying to login in...

`
console.log(welcome)