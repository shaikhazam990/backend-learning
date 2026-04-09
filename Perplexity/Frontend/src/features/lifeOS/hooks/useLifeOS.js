import { useDispatch, useSelector } from 'react-redux'
import * as api from '../service/lifeOS.api'
import {
    setHabits, setMoods, setSpendings, setSummary, setAdvice,
    setAdviceLoading, setLoading, setError,
    addHabit, updateHabit, removeHabit,
    setTodayMood, addSpending, removeSpending
} from '../lifeOS.slice'

export function useLifeOS() {
    const dispatch = useDispatch()
    const state = useSelector(s => s.lifeOS)

    async function loadAll() {
        dispatch(setLoading(true))
        try {
            const [habitsRes, moodsRes, spendingsRes, summaryRes] = await Promise.all([
                api.getHabits(),
                api.getMoods(),
                api.getSpendings(),
                api.getSummary(),
            ])
            dispatch(setHabits(habitsRes.habits))
            dispatch(setMoods(moodsRes.moods))
            dispatch(setSpendings(spendingsRes.spendings))
            dispatch(setSummary(summaryRes.summary))
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function fetchAdvice() {
        dispatch(setAdviceLoading(true))
        try {
            const data = await api.getDailyAdvice()
            dispatch(setAdvice(data.advice))
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setAdviceLoading(false))
        }
    }

    async function handleCreateHabit(data) {
        const res = await api.createHabit(data)
        dispatch(addHabit(res.habit))
    }

    async function handleToggleHabit(id) {
        const res = await api.toggleHabit(id)
        dispatch(updateHabit(res.habit))
    }

    async function handleDeleteHabit(id) {
        await api.deleteHabit(id)
        dispatch(removeHabit(id))
    }

    async function handleLogMood(data) {
        const res = await api.logMood(data)
        dispatch(setTodayMood(res.mood))
    }

    async function handleAddSpending(data) {
        const res = await api.addSpending(data)
        dispatch(addSpending(res.spending))
    }

    async function handleDeleteSpending(id) {
        await api.deleteSpending(id)
        dispatch(removeSpending(id))
    }

    return {
        ...state,
        loadAll,
        fetchAdvice,
        handleCreateHabit,
        handleToggleHabit,
        handleDeleteHabit,
        handleLogMood,
        handleAddSpending,
        handleDeleteSpending,
    }
}