import habitModel from "../models/habit.model.js";
import moodModel from "../models/mood.model.js";
import spendingModel from "../models/spending.model.js";
import { getLifeOSAdvice } from "../services/ai.service.js";

const today = () => new Date().toISOString().split('T')[0];


export async function createHabit(req, res) {
    try {
        const { name, icon, category, frequency } = req.body;
        const habit = await habitModel.create({
            user: req.user.id, name, icon, category, frequency
        });
        res.status(201).json({ success: true, habit });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}


export async function getHabits(req, res) {
    try {
        const habits = await habitModel.find({ user: req.user.id, isActive: true });
        res.status(200).json({ success: true, habits });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function toggleHabit(req, res) {
    try {
        const { habitId } = req.params;
        const habit = await habitModel.findOne({ _id: habitId, user: req.user.id });
        if (!habit) return res.status(404).json({ success: false, message: "Habit not found" });

        const todayStr = today();
        const alreadyDone = habit.completedDates.includes(todayStr);

        if (alreadyDone) {
            habit.completedDates = habit.completedDates.filter(d => d !== todayStr);
        } else {
            habit.completedDates.push(todayStr);
            // Update streak
            habit.currentStreak += 1;
            if (habit.currentStreak > habit.longestStreak) {
                habit.longestStreak = habit.currentStreak;
            }
        }

        await habit.save();
        res.status(200).json({ success: true, habit });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function deleteHabit(req, res) {
    try {
        const { habitId } = req.params;
        await habitModel.findOneAndUpdate(
            { _id: habitId, user: req.user.id },
            { isActive: false }
        );
        res.status(200).json({ success: true, message: "Habit deleted" });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function logMood(req, res) {
    try {
        const { score, note, energy, stress } = req.body;
        const todayStr = today();

        const existing = await moodModel.findOne({ user: req.user.id, date: todayStr });
        if (existing) {
            existing.score = score;
            existing.note = note;
            existing.energy = energy;
            existing.stress = stress;
            await existing.save();
            return res.status(200).json({ success: true, mood: existing });
        }

        const mood = await moodModel.create({
            user: req.user.id, score, note, energy, stress, date: todayStr
        });
        res.status(201).json({ success: true, mood });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function getMoods(req, res) {
    try {
        const { days = 30 } = req.query;
        const moods = await moodModel.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(Number(days));
        res.status(200).json({ success: true, moods });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function addSpending(req, res) {
    try {
        const { amount, category, description } = req.body;
        const spending = await spendingModel.create({
            user: req.user.id,
            amount, category, description,
            date: today()
        });
        res.status(201).json({ success: true, spending });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function getSpendings(req, res) {
    try {
        const { days = 30 } = req.query;
        const spendings = await spendingModel.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(Number(days) * 20);
        res.status(200).json({ success: true, spendings });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function deleteSpending(req, res) {
    try {
        await spendingModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function getDailyAdvice(req, res) {
    try {
        const userId = req.user.id;
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const dateStr = last7Days.toISOString().split('T')[0];

        const [habits, moods, spendings] = await Promise.all([
            habitModel.find({ user: userId, isActive: true }),
            moodModel.find({ user: userId }).sort({ date: -1 }).limit(7),
            spendingModel.find({ user: userId }).sort({ date: -1 }).limit(20)
        ]);

        const advice = await getLifeOSAdvice({ habits, moods, spendings });

        res.status(200).json({ success: true, advice });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}

export async function getDashboardSummary(req, res) {
    try {
        const userId = req.user.id;
        const todayStr = today();

        const [habits, todayMood, recentSpendings] = await Promise.all([
            habitModel.find({ user: userId, isActive: true }),
            moodModel.findOne({ user: userId, date: todayStr }),
            spendingModel.find({ user: userId }).sort({ createdAt: -1 }).limit(5)
        ]);

        const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
        const totalSpentToday = recentSpendings
            .filter(s => s.date === todayStr)
            .reduce((sum, s) => sum + s.amount, 0);

        res.status(200).json({
            success: true,
            summary: {
                habits: {
                    total: habits.length,
                    completedToday,
                    completionRate: habits.length > 0
                        ? Math.round((completedToday / habits.length) * 100)
                        : 0
                },
                mood: todayMood || null,
                spending: {
                    todayTotal: totalSpentToday,
                    recentTransactions: recentSpendings
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message });
    }
}