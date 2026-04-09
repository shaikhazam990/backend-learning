import { createSlice } from '@reduxjs/toolkit'

const lifeOSSlice = createSlice({
    name: 'lifeOS',
    initialState: {
        habits: [],
        moods: [],
        spendings: [],
        summary: null,
        advice: null,
        adviceLoading: false,
        loading: false,
        error: null,
    },
    reducers: {
        setHabits:    (s, a) => { s.habits = a.payload },
        setMoods:     (s, a) => { s.moods = a.payload },
        setSpendings: (s, a) => { s.spendings = a.payload },
        setSummary:   (s, a) => { s.summary = a.payload },
        setAdvice:    (s, a) => { s.advice = a.payload },
        setAdviceLoading: (s, a) => { s.adviceLoading = a.payload },
        setLoading:   (s, a) => { s.loading = a.payload },
        setError:     (s, a) => { s.error = a.payload },

        addHabit: (s, a) => { s.habits.push(a.payload) },
        updateHabit: (s, a) => {
            const idx = s.habits.findIndex(h => h._id === a.payload._id)
            if (idx !== -1) s.habits[idx] = a.payload
        },
        removeHabit: (s, a) => {
            s.habits = s.habits.filter(h => h._id !== a.payload)
        },
        setTodayMood: (s, a) => {
            const idx = s.moods.findIndex(m => m.date === a.payload.date)
            if (idx !== -1) s.moods[idx] = a.payload
            else s.moods.unshift(a.payload)
        },
        addSpending: (s, a) => { s.spendings.unshift(a.payload) },
        removeSpending: (s, a) => {
            s.spendings = s.spendings.filter(sp => sp._id !== a.payload)
        },
    }
})

export const {
    setHabits, setMoods, setSpendings, setSummary, setAdvice,
    setAdviceLoading, setLoading, setError,
    addHabit, updateHabit, removeHabit,
    setTodayMood, addSpending, removeSpending
} = lifeOSSlice.actions

export default lifeOSSlice.reducer