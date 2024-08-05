import { WechatyBuilder, Message, FileBox } from 'wechaty';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import speech from '@google-cloud/speech';
import dotenv from 'dotenv';

dotenv.config();

const wechaty = WechatyBuilder.build();
const speechClient = new speech.SpeechClient();

async function downloadAudioFile(msg) {
  const fileBox = await msg.toFileBox();
  const filePath = path.join(__dirname, fileBox.name);
  await fileBox.toFile(filePath);
  return filePath;
}

async function convertToWav(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .toFormat('wav')
      .on('end', () => resolve(outputFile))
      .on('error', (err) => reject(err))
      .save(outputFile);
  });
}

async function transcribeAudio(file) {
  const fileContent = fs.readFileSync(file);

  const audio = {
    content: fileContent.toString('base64'),
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'zh-CN', // Set language code to Simplified Chinese
  };

  const request = {
    audio,
    config,
  };

  const [response] = await speechClient.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');

  return transcription;
}

async function handleVoiceMessage(msg) {
  const audioFile = await downloadAudioFile(msg);
  const wavFile = path.join(__dirname, 'converted.wav');
  await convertToWav(audioFile, wavFile);

  const transcription = await transcribeAudio(wavFile);

  fs.unlinkSync(audioFile);
  fs.unlinkSync(wavFile);

  msg.say(`Transcription: ${transcription}`);
}

wechaty.on('message', async (msg) => {
  if (msg.type() === Message.Type.Audio) {
    await handleVoiceMessage(msg);
  }
});

wechaty.start().catch(console.error);
