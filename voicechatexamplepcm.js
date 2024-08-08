import { WechatyBuilder, log, ScanStatus } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import fetch from 'node-fetch';
import { writeFileSync, unlinkSync,readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { FileBox } from 'file-box';
import {convertToSilk} from './fromMp3ToSilk.js';
import {pcm2slk} from 'node-silk';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wechaty = WechatyBuilder.build();
const allowedContacts = ['叶建平', '庆菊', 'Yale', 'AI人工智能助手'];

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getChatGPTReply(message) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content.trim();
    return reply;
  } catch (error) {
    console.error('ChatGPT API request failed:', error);
    return "Sorry, I couldn't generate a response at this time.";
  }
}

// async function generateSpeech(text, outputFile,msg) {
//   try {
//     const response = await fetch('https://api.openai.com/v1/audio/speech', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: "tts-1",
//         input: text,
//         voice: "onyx",
//         response_format: "pcm", // changed mp3 to pcm
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`TTS API request failed: ${response.statusText}`);
//     }
//     const contentType = response.headers.get('content-type');
//     console.log("Content-Type of response: " + contentType);

//     if (contentType === 'audio/pcm') {
//       const pcmbuf = await response.buffer();
//       const slkbuf = pcm2slk(pcmbuf);
//       writeFileSync(outputFile, pcmbuf);
//       // Assuming msg.say can accept a buffer directly
//       const voice = FileBox.fromBuffer(slkbuf,'output.silk');
//     //   voice.mediaType = 'audio/silk';
//       msg.say(voice); 
//       console.log('Speech synthesis complete, file saved.');
//       return outputFile;
//     } else {
//       throw new Error('Unexpected response type. Expected an MP3 file.');
//     }
//   } catch (error) {
//     console.error('TTS API request failed:', error);
//     return null;
//   }
// }
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
          response_format: "pcm",
        }),
      });
  
      if (!response.ok) {
        throw new Error(`TTS API request failed: ${response.statusText}`);
      }
  
      const contentType = response.headers.get('content-type');
      console.log("Content-Type of response: " + contentType);
  
      if (contentType === 'audio/pcm') {
        const pcmbuf = await response.buffer();
  
        // Convert PCM buffer to silk format (assuming pcm2slk is a valid conversion method)
        const slkbuf = pcm2slk(pcmbuf);
  
        writeFileSync(outputFile, slkbuf);
        
        const voice = FileBox.fromBuffer(slkbuf, 'output.silk');
        voice.metadata = {
          voiceLength: 20000
        };
        
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

async function onMessage(msg) {
  log.info('StarterBot', 'Message: %s', msg);

  if (msg.self()) {
    return;
  }

  const from = msg.talker();
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

     
      
      // Get ChatGPT reply
      const reply = await getChatGPTReply(text);

      // Generate speech
      const pcmFile = join(__dirname, 'response.pcm');
    //   const mp3File = join(__dirname, 'response.mp3');
      const silkFile = join(__dirname, 'response.silk');
      await generateSpeech(reply, pcmFile,msg);
    //   if (pcmFile) {
    //     // Convert PCM to Silk
    //     const pcmbuf = readFileSync("./response.pcm");
    //     // await convertToSilk(pcmFile, silkFile);
    //     const slkbuf = pcm2slk(pcmbuf);

    //     // Send the generated Silk file
    //     const fileBox = FileBox.fromFile(silkFile);
    //     // const fileBox = FileBox.fromFile(slkbuf);
    //     fileBox.metadata = {
    //         voiceLength: 60000 // Adjust the voice length as per your requirement in milliseconds
    //     };
    //     await msg.say(fileBox);
    //     // await msg.say(slkbuf);

    //     // Clean up
    //     unlinkSync(pcmFile);
    //     unlinkSync(silkFile);

    //   } else {
    //     await msg.say("Sorry, I couldn't generate a speech response at this time.");
    //   }
    
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