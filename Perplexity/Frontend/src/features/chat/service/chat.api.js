import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

export const getChats = async () => {
    const response = await api.get("/api/chats")
    return response.data
}

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`)
    return response.data
}

export async function sendMessageStream({ message, chatId }, callbacks) {
    let response;
    try {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/message`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',  // ← tell server you want SSE
            },
            credentials: 'include',
            body: JSON.stringify({ message, chat: chatId })
        })
    } catch (err) {
        callbacks.onError('Failed to connect to server')
        return
    }

    if (!response.ok) {
        callbacks.onError(`Server error: ${response.status}`)
        return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''  // ← KEY FIX: buffer incomplete chunks

    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })  // ← stream:true keeps state

            // Split on double newline (SSE event boundary)
            const events = buffer.split('\n\n')
            
            // Last element may be incomplete — keep it in buffer
            buffer = events.pop()

            for (const event of events) {
                const lines = event.split('\n')
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const raw = line.slice(6).trim()
                    if (!raw || raw === '[DONE]') continue

                    try {
                        const data = JSON.parse(raw)
                        if (data.type === 'init')  callbacks.onInit(data)
                        if (data.type === 'chunk') callbacks.onChunk(data.text)
                        if (data.type === 'done')  callbacks.onDone(data)
                        if (data.type === 'error') callbacks.onError(data.message)
                    } catch (e) {
                        console.warn('Failed to parse SSE line:', raw)
                    }
                }
            }
        }
    } catch (err) {
        callbacks.onError('Stream interrupted: ' + err.message)
    } finally {
        reader.releaseLock()
    }
}