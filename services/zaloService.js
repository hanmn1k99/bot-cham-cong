const db = require('../database');
const { BOT_TOKEN } = require('../config/constants');

// Helper to send message via Zalo API
async function sendZaloMessage(chatId, text) {
  try {
    const response = await fetch(`https://bot-api.zaloplatforms.com/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
    const data = await response.json();
    if (!data.ok) {
      console.error('Failed to send message:', data);
    }
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

async function sendToAdmins(text) {
  const adminId = process.env.ADMIN_CHAT_ID;
  if (adminId) {
    await sendZaloMessage(adminId, text);
  }
}

async function isAdmin(senderId) {
  return senderId === process.env.ADMIN_CHAT_ID;
}

module.exports = {
  sendZaloMessage,
  sendToAdmins,
  isAdmin
};
