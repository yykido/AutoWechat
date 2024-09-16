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
let tempConversations;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    db = client.db('wechat_bot');
    conversations = db.collection('conversations');
    tempConversations = db.collection('tempConversations');
    
    console.log('Database and collections initialized');
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

async function addTempConversation(user, message, reply) {
  try {
    const result = await tempConversations.updateOne(
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
    console.log(`Temporary conversation updated for user ${user}`);
    return result;
  } catch (error) {
    console.error('Error adding temporary conversation:', error);
  }
}

async function getTempConversation(user) {
  try {
    const result = await tempConversations.findOne({ user: user });
    return result ? result.conversation : [];
  } catch (error) {
    console.error('Error getting temporary conversation:', error);
    return [];
  }
}

async function deleteTempConversation(user) {
  try {
    const result = await tempConversations.deleteOne({ user: user });
    console.log(`Temporary conversation deleted for user ${user}`);
    return result;
  } catch (error) {
    console.error('Error deleting temporary conversation:', error);
  }
}

export { connectToDatabase, addConversation, getConversation, addTempConversation, getTempConversation, deleteTempConversation };