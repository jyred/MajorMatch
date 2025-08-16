import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ChatMessage } from '../server/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, sessionId, riasecScores, recommendedMajors } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "메시지가 필요합니다." });
    }

    const { storage } = await import('../server/storage');
    const { naturalChatService } = await import('../server/natural-chat');
    
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    // Get or create chat session
    let session = sessionId ? await storage.getChatSession(sessionId) : null;
    
    if (!session) {
      session = await storage.createChatSession({
        userId,
        messages: []
      });
    }
    
    // Update user profile with RIASEC scores if available
    if (riasecScores) {
      naturalChatService.updateUserProfile(userId, { riasecScores });
    }

    // Generate natural response
    const aiResponse = await naturalChatService.generateNaturalResponse(userId, message);

    // Extract interests and update profile
    if (!aiResponse.includes("시간당 메시지 한도") && !aiResponse.includes("부적절한 내용")) {
      await naturalChatService.extractAndUpdateInterests(userId, message);
      naturalChatService.updateConversationHistory(userId, message, aiResponse);
    }

    // Update session with new messages
    const newMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    
    const aiMessage: ChatMessage = {
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...session.messages, newMessage, aiMessage];
    
    await storage.updateChatSession(session.id, {
      messages: updatedMessages
    });

    return res.json({
      response: aiResponse,
      sessionId: session.id
    });
  } catch (error) {
    console.error("Natural chat error:", error);
    return res.status(500).json({ message: "채팅 중 오류가 발생했습니다." });
  }
}
