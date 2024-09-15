import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@cluster0.kh62h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let conversations;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    db = client.db('wechat_bot');
    conversations = db.collection('conversations');
    
    console.log('Database and collection initialized');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function addConversation(user, message, reply) {
  try {
    const result = await conversations.updateOne(
      { user: user },
      {
        $push: {
          conversation: {
            $each: [
              { role: "user", content: message },
              { role: "assistant", content: reply }
            ]
          }
        }
      },
      { upsert: true }
    );
    console.log(`Conversation updated for user ${user}`);
    return result;
  } catch (error) {
    console.error('Error adding conversation:', error);
  }
}

async function getConversation(user) {
  try {
    const result = await conversations.findOne({ user: user });
    return result ? result.conversation : [];
  } catch (error) {
    console.error('Error getting conversation:', error);
    return [];
  }
}

export { connectToDatabase, addConversation, getConversation };