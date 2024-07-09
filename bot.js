// import { WechatyBuilder, log, ScanStatus } from 'wechaty';
// import qrcodeTerminal from 'qrcode-terminal';

// const wechaty = WechatyBuilder.build();
// const allowedContacts = ['Evie💫', 'specific-contact-2']; // 允许自动回复的用户列表

// function onScan(qrcode, status) {
//   if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
//     qrcodeTerminal.generate(qrcode, { small: true });
//     console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`);
//   } else {
//     log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status);
//   }
// }

// function onLogin(user) {
//   log.info('StarterBot', '%s logged in', user);
// }

// function onLogout(user) {
//   log.info('StarterBot', '%s logged out', user);
// }

// function onMessage(msg) {
//   log.info('StarterBot', 'Message: %s', msg);

//   if (msg.self()) {
//     return;
//   }

//   const from = msg.from();
//   const contactName = from.name(); // 获取发送者的名称
//   const room = msg.room(); // 检查消息是否来自群聊

//   // 忽略来自群聊的消息
//   if (room) {
//     log.info('Message', `Ignoring message from room: ${room.topic()}`);
//     return;
//   }

//   if (allowedContacts.includes(contactName)) {
//     if (msg.type() === wechaty.Message.Type.Text) {
//       const text = msg.text();

//       log.info('Message', `Contact: ${from.name()} Text: ${text}`);
//       // 自动回复单聊消息
//       msg.say(`你说的是：“${text}”`);
//     }
//   } else {
//     log.info('StarterBot', `Message from ${contactName} is ignored.`);
//   }
// }

// wechaty
//   .on('scan', onScan)
//   .on('login', onLogin)
//   .on('logout', onLogout)
//   .on('message', onMessage);

// wechaty.start()
//   .catch(e => console.error('Bot start failed:', e));

import { WechatyBuilder, log, ScanStatus } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const wechaty = WechatyBuilder.build();

const allowedContacts = ['specific-contact-2']; // 允许自动回复的用户列表

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

