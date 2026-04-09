import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import chatReducer from "../features/chat/chat.slice";
import lifeOSReducer from "../features/lifeOS/lifeOS.slice";  // ← add

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        lifeOS: lifeOSReducer,  // ← add
    }
})