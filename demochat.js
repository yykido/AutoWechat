// import OpenAI from "openai";

// const openai = new OpenAI();

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "system", content: "You are a helpful assistant." }],
//     model: "gpt-3.5-turbo",
//   });

//   console.log(completion.choices[0]);
// }

// main();

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
console.log('Loaded API Key:', apiKey); // 确认API密钥已正确加载

const openai = new OpenAI({
  apiKey: apiKey,
});

async function main() {
  try {
    console.log('Sending request to OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, who are you?' },
      ],
    });

    console.log('Received response from OpenAI API:', completion.choices[0].message.content);
  } catch (error) {
    console.error('Error creating completion:', error);
  }
}

main();

// import OpenAI from "openai";
// import dotenv from 'dotenv';

// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function main() {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: "Hello, who are you?" }],
//     });

//     console.log(completion.choices[0].message.content);
//   } catch (error) {
//     console.error('Error creating completion:', error);
//   }
// }

// main();