import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import speech from '@google-cloud/speech';

// Initialize the Google Cloud Speech-to-Text client
const speechClient = new speech.SpeechClient();

async function silkToText(silkFilePath) {
  try {
    // Define the output wav file path
    const wavFilePath = silkFilePath.replace('.sil', '.wav');


    // Convert silk to wav
    await new Promise((resolve, reject) => {
        console.log("ffmpeg: " + silkFilePath);
      ffmpeg(silkFilePath)
        .toFormat('wav')
        .on('end', () => resolve(wavFilePath))
        .on('error', reject)
        .save(wavFilePath);
    });

    // Read the wav file content
    const fileContent = fs.readFileSync(wavFilePath);

    // Prepare the request for Google Speech-to-Text
    const audio = {
      content: fileContent.toString('base64'),
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'zh-CN',
    };
    const request = {
      audio,
      config,
    };

    // Perform the transcription
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // Clean up the temporary wav file
    fs.unlinkSync(wavFilePath);
    fs.unlinkSync(silkFilePath);

    // Return the transcribed text
    return transcription;
  } catch (error) {
    console.error('Error converting silk to text:', error);
    throw error;
  }
}

export { silkToText };