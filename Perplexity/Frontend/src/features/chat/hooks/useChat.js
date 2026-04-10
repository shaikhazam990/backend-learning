import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessageStream, getChats, getMessages, deleteChat } from "../service/chat.api";
import {
    setChats, setCurrentChatId, setError, setLoading,
    createNewChat, addNewMessage, addMessages,
    appendToLastMessage, setStreamingDone
} from "../chat.slice";
import { useDispatch } from "react-redux";

export const useChat = () => {
    const dispatch = useDispatch()

    async function handleSendMessage({ message, chatId }) {
        const activeChatIdRef = { current: chatId }

        if (chatId) {
            dispatch(addNewMessage({ chatId, content: message, role: "user" }))
        }

        try {
            await sendMessageStream({ message, chatId }, {
                onInit: ({ chat, title }) => {
                    if (!chatId && chat) {
                        dispatch(createNewChat({ chatId: chat._id, title }))
                        dispatch(addNewMessage({ chatId: chat._id, content: message, role: "user" }))
                        activeChatIdRef.current = chat._id
                        dispatch(setCurrentChatId(chat._id))
                    }
                    dispatch(addNewMessage({
                        chatId: activeChatIdRef.current,
                        content: '',
                        role: "ai",
                        isStreaming: true
                    }))
                },
                onChunk: (text) => {
                    dispatch(appendToLastMessage({
                        chatId: activeChatIdRef.current,
                        text
                    }))
                },
                onDone: () => {
                    dispatch(setStreamingDone({ chatId: activeChatIdRef.current }))
                },
                onError: (msg) => {
                    console.error('Stream error:', msg)
                    dispatch(setError(msg))
                }
            })
        } catch (err) {
            dispatch(setError(err.message))
            console.error("Send message error:", err)
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        try {
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleOpenChat(chatId, chats) {
        if (chats[chatId]?.messages.length === 0) {
            try {
                const data = await getMessages(chatId)
                const { messages } = data
                dispatch(addMessages({
                    chatId,
                    messages: messages.map(msg => ({
                        content: msg.content,
                        role: msg.role,
                    }))
                }))
            } catch (err) {
                console.error("Load messages error:", err)
            }
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            await handleGetChats()
        } catch (err) {
            console.error("Delete chat error:", err)
            throw err
        }
    }

    function handleNewChat() {
        dispatch(setCurrentChatId(null))
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleNewChat,
    }
}