# AutoWechat Bot

AutoWechat Bot is a WeChat bot that automatically replies to messages from specified contacts using the Wechaty framework. It can scan a QR code for login and handle incoming messages, selectively replying based on the sender.

## Features

- Automatically logs in using a QR code.
- Replies to text messages from specified contacts.
- Ignores messages from group chats.
- Logs important events such as login, logout, and messages.

## Prerequisites

- Node.js (version 16.0.0 or later)
- Wechaty and related dependencies

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/AutoWechat.git
   cd AutoWechat
2. Install the dependencies:

   ```bash
   npm install
   
## Configuration
1. Ensure your package.json is configured to use ES modules:
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
2. Update the allowedContacts array in bot.js to specify the contacts you want the bot to automatically reply to:
    ```javascript
    const allowedContacts = ['specific-contact-1', 'specific-contact-2']; // Specify allowed contacts here
## Usage
 1. Run the bot:
    ```bash
    node bot.js
2. Scan the QR code with your WeChat app to log in.
3. The bot will automatically reply to messages from specified contacts and ignore messages from group chats.

## Documentation
For more details, please refer to the [Wechaty official documentation](https://www.npmjs.com/package/wechaty).

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Contact
For any questions, please contact yystephan@gmail.com.
