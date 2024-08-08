import { WechatyBuilder, log, ScanStatus } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { writeFileSync, unlinkSync,readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { FileBox } from 'file-box';
import {pcm2slk} from 'node-silk';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wechaty = WechatyBuilder.build();
const allowedContacts = ['叶建平','庆菊','Yale','AI人工智能助手']; // Specify allowed contacts here
const userConversations = {}; // Store user conversations here
const __dirname = dirname(fileURLToPath(import.meta.url));

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
async function generateSpeech(text, outputFile, msg) {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "onyx",
          response_format: "mp3",
        }),
      });
  
      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.statusText}`);
      }
  
      const contentType = response.headers.get('content-type');
      console.log("Content-Type of response: " + contentType);
  
      if (contentType === 'audio/mpeg') {  //'audio/pcm'
        // const pcmbuf = await response.buffer();
        const mp3buf = await response.buffer();
  
        // Convert PCM buffer to silk format (assuming pcm2slk is a valid conversion method)
        // const slkbuf = pcm2slk(pcmbuf);
  
        // writeFileSync(outputFile, slkbuf);
        
        const voice = FileBox.fromBuffer(mp3buf, 'response.mp3');
        // voice.metadata = {
        //   voiceLength: 20000
        // };
        
        await msg.say(voice);
        console.log('Speech synthesis complete, file saved.');
        return outputFile;
      } else {
        throw new Error('Unexpected response type. Expected an audio/pcm file.');
      }
    } catch (error) {
      console.error('TTS API request failed:', error);
      return null;
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
  // transfer the voice message (silk) to text message
  
  // add text to the context of text chat
    // send request (with whole context) to chatGPT API endpoint to generate voice message (mp3)
  // convert voice message (mp3) to text message and add to the context of text chat
  // convert voice message (mp3) to (silk) format and send to other users
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
    // if the msg.type() is Audio convert it to text
    let text = "";
    if(msg.type() === wechaty.Message.Type.Text) {
        text = msg.text();
    }
    else {
        text = "from autio";
    }
    log.info('Message', `Contact: ${from.name()} Text: ${text}`);
    if (text === "结束对话" && userConversations[contactName]) {
      userConversations[contactName] = [{ role: "system", content: "You are a helpful assistant." }];
      log.info('Message', `Chat already finished`);
      msg.say("对话已结束");
    } else {
      const reply = await getChatGPTReply(contactName, text);
      const mp3File = join(__dirname, 'response.mp3');
      generateSpeech(reply,mp3File,msg);
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