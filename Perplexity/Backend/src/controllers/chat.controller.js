import { generateChatTitle, generateResponseStream } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


function sendEvent(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function sendMessage(req, res) {
    const { message, chat: chatId } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.flushHeaders();

    let chat = null;
    let title = null;

    try {
        if (!chatId) {
            title = await generateChatTitle(message);
            chat = await chatModel.create({ user: req.user.id, title });
        } else {
            chat = await chatModel.findById(chatId);
            if (!chat) {
                sendEvent(res, { type: 'error', message: 'Chat not found' });
                return res.end();
            }
        }

        const activeChatId = chat._id;

        await messageModel.create({
            chat: activeChatId,
            content: message,
            role: "user"
        });

        sendEvent(res, {
            type: 'init',
            chat: { _id: activeChatId },
            title: title || chat.title
        });

        const messages = await messageModel.find({ chat: activeChatId }).sort({ createdAt: 1 });

        let fullContent = '';

        await generateResponseStream(messages, (chunk) => {
            fullContent += chunk;
            sendEvent(res, { type: 'chunk', text: chunk });
        });

        const aiMessage = await messageModel.create({
            chat: activeChatId,
            content: fullContent,
            role: "ai"
        });

        sendEvent(res, { type: 'done', aiMessage });

    } catch (err) {
        console.error('sendMessage error:', err);
        sendEvent(res, { type: 'error', message: err.message });
    } finally {
        res.end();
    }
}

export async function getChats(req, res) {
    try {
        const chats = await chatModel.find({ user: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json({
            message: "Chats retrieved successfully",
            chats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });
        res.status(200).json({
            message: "Messages retrieved successfully",
            messages
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOneAndDelete({ _id: chatId, user: req.user.id });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        await messageModel.deleteMany({ chat: chatId });

        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}