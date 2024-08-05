import fs from 'fs';
import speech from '@google-cloud/speech';

// Initialize the speech client
const speechClient = new speech.SpeechClient();

async function transcribeAudio(file) {
  // Read the audio file
  const fileContent = fs.readFileSync(file);

  // Prepare the audio content
  const audio = {
    content: fileContent.toString('base64'),
  };

  // Configure the request
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'zh-CN', // Set language code to Simplified Chinese
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

  return transcription;
}

// Export the function
export { transcribeAudio };