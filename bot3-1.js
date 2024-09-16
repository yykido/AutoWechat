import { connectToDatabase, addConversation, getConversation, addTempConversation, getTempConversation, deleteTempConversation } from './db.js';
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
import {silkToText} from './silk2text.js';


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wechaty = WechatyBuilder.build();
const allowedContacts = ['叶建平','庆菊','Yale','AI人工智能助手']; // Specify allowed contacts here
const __dirname = dirname(fileURLToPath(import.meta.url));
await connectToDatabase();

async function getChatGPTReply(user, message) {
  try {
    const tempConversation = await getTempConversation(user);
    tempConversation.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: tempConversation,
    });

    const reply = completion.choices[0].message.content.trim();

    await addTempConversation(user, message, reply);
    await addConversation(user, message, reply);

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

  if (msg.self()) return;

  const from = msg.talker();
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
    else if(msg.type() === wechaty.Message.Type.Audio) {
        // // convert voice message to text
        // console.log('Received a voice message.');
        // // 打印消息类型
        // console.log('Message Type:', typeof msg);

        // // 打印消息内容
        // console.log('Message Content:', msg);

        // // 更详细地打印出消息对象的内容
        // console.dir(msg, { depth: null });

        // // 打印出特定属性
        // console.log('Message Type (Enum Value):', msg.type());
        // // msg.say(msg);

        /**
         * SUCCESS!!!
         * below are the version of voice message to text
         */

        const fileBox = await msg.toFileBox();
        // console.log(`File name: ${fileBox.name}`);

        // 保存语音文件到本地
        const filePath = `./${fileBox.name}`;
        await fileBox.toFile(filePath);
        console.log(`Voice message saved to ${filePath}`);
        try {
            text = await silkToText(filePath);
        } catch (error) {
            console.error('Failed to translate voice message:', error);
        }
        console.log(`Voice message translated to ${text}`);

        /**
         * TEST
         * below are the codes to get the voice audio and send responses quickly to check the "Send voice message function"
         */
        // const fileBox = await msg.toFileBox();

        // // 检查文件名称和类型（可选）
        // log.info('FileBox details:', fileBox);

        // const newFileBox = FileBox.fromBuffer(await fileBox.toBuffer(), 'voice.silk');

        // // 尝试发送
        // await self.send(newFileBox);


        // log.info('Echoed the audio message back');
        // return;
    }
    else {
        msg.say("Other type message");
    }
    log.info('Message', `Contact: ${from.name()} Text: ${text}`);
    if (text === "结束对话") {
      await deleteTempConversation(contactName);
      log.info('Message', `Chat finished for ${contactName}`);
      msg.say("对话已结束");
    } else {
      const reply = await getChatGPTReply(contactName, text);
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