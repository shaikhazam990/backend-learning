import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '✅' },
    category: {
        type: String,
        enum: ['health', 'work', 'learning', 'fitness', 'mindfulness', 'other'],
        default: 'other'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'daily'
    },
    completedDates: [{ type: String }],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

habitSchema.methods.isCompletedToday = function () {
    const today = new Date().toISOString().split('T')[0];
    return this.completedDates.includes(today);
};

const habitModel = mongoose.model('Habit', habitSchema);
export default habitModel;