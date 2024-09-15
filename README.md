# AutoWechat Bot

AutoWechat Bot is a WeChat bot that automatically replies to messages from specified contacts using the Wechaty framework. It can handle text and voice messages, and respond with both text and voice.

## Features

- Automatically logs in using a QR code
- Replies to text messages from specified contacts
- Handles voice messages and converts them to text
- Generates voice responses using OpenAI's Text-to-Speech API
- Ignores messages from group chats
- Logs important events such as login, logout, and messages
- Stores conversations in MongoDB

## Prerequisites

- Node.js (version 16.0.0 or later)
- MongoDB Atlas account
- OpenAI API key
- Google Cloud Speech-to-Text API credentials

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/AutoWechat.git
   cd AutoWechat
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory with the following content:

   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google_credentials.json
   MONGODB_USERNAME=your_mongodb_username
   MONGODB_PASSWORD=your_mongodb_password
   ```

2. Update the `allowedContacts` array in `bot3-1.js` to specify the contacts you want the bot to automatically reply to:

   ```javascript
   const allowedContacts = ['contact1', 'contact2', 'contact3'];
   ```
2. Ensure your package.json is configured to use ES modules:
   ```json
   {
      "name": "auto-wechat",
      "version": "1.0.0",
      "type": "module",
      "dependencies": {
        "wechaty": "^1.0.0",
        "wechaty-puppet-wechat": "^1.0.0",
        "qrcode-terminal": "^1.0.0"
      }
    }   

## Usage

1. Run the bot:

   ```bash
   node bot3-1.js
   ```

2. Scan the QR code with your WeChat app to log in.

3. The bot will automatically reply to messages from specified contacts and ignore messages from group chats.

## Project Structure

- `bot3-1.js`: Main bot logic
- `db.js`: MongoDB connection and operations
- `silk2text.js`: Voice message to text conversion
- `tools.js`: Utility functions for audio transcription

## Documentation

For more details on the Wechaty framework, please refer to the [Wechaty official documentation](https://www.npmjs.com/package/wechaty).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For any questions, please contact yystephan@gmail.com.


voice audio from pcm to silk
https://socket.dev/npm/package/node-silk
