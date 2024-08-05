// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// import ffmpeg from 'fluent-ffmpeg';

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// async function convertToSilk(inputFile, outputFile) {
//   return new Promise((resolve, reject) => {
//     ffmpeg(inputFile)
//       .toFormat('silk')
//       .on('end', () => {
//         console.log('Conversion to Silk format completed');
//         resolve(outputFile);
//       })
//       .on('error', (err) => {
//         console.error('Error during conversion to Silk format:', err);
//         reject(err);
//       })
//       .save(outputFile);
//   });
// }

// export { convertToSilk };

// v2
// import { exec } from 'child_process';
// import { promisify } from 'util';

// const execPromise = promisify(exec);

// const encoderPath = '/path/to/silk/encoder'; // Update this path

// async function convertToSilk(inputFile, outputFile) {
//   const command = `${encoderPath} ${inputFile} ${outputFile}`;
  
//   try {
//     await execPromise(command);
//     console.log('Conversion to Silk format completed');
//     return outputFile;
//   } catch (error) {
//     console.error('Error during conversion to Silk format:', error);
//     throw error;
//   }
// }

// export { convertToSilk };


// v3
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Define __dirname in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const execPromise = promisify(exec);

// // Assuming converter.sh is in the silk-v3-decoder directory within your project
// const converterScriptPath = path.join(__dirname, 'silk-v3-decoder', 'converter.sh');

// async function convertToSilk(inputFile, outputFile) {
//   // We need to call the converter script with input and output
//   const command = `sh ${converterScriptPath} ${inputFile} silk`;

//   try {
//     await execPromise(command);
//     console.log('Conversion to Silk format completed');
//     // Move the output file to the desired location
//     await execPromise(`mv ${inputFile.replace('.mp3', '.silk')} ${outputFile}`);
//     return outputFile;
//   } catch (error) {
//     console.error('Error during conversion to Silk format:', error);
//     throw error;
//   }
// }

// export { convertToSilk };


import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const execPromise = promisify(exec);

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assuming converter.sh is in the silk-v3-decoder directory within your project
const converterScriptPath = path.join(__dirname, 'silk-v3-decoder', 'converter.sh');

async function convertToSilk(inputFile, outputFile) {
  // We need to call the converter script with input and output
  const command = `sh ${converterScriptPath} ${inputFile} silk`;

  console.log(`Running command: ${command}`);

  try {
    await execPromise(command);
    console.log('Conversion to Silk format completed');

    // Ensure the output file is created
    const expectedOutputFile = inputFile.replace('.mp3', '.silk');
    if (fs.existsSync(expectedOutputFile)) {
      console.log(`Output file created: ${expectedOutputFile}`);
      return expectedOutputFile;
    } else {
      throw new Error(`Expected output file ${expectedOutputFile} not found.`);
    }
  } catch (error) {
    console.error('Error during conversion to Silk format:', error);
    throw error;
  }
}

export { convertToSilk };
