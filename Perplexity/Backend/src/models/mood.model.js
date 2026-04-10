import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    label: {
        type: String,
        enum: ['terrible', 'bad', 'poor', 'low', 'okay', 'fine', 'good', 'great', 'excellent', 'amazing'],
    },
    note: { type: String, trim: true, maxlength: 500 },
    energy: { type: Number, min: 1, max: 10 },
    stress:  { type: Number, min: 1, max: 10 },
    date: {
        type: String,
        required: true,
    }
}, { timestamps: true });

moodSchema.pre('save', async function () {
    const labels = ['', 'terrible', 'bad', 'poor', 'low', 'okay', 'fine', 'good', 'great', 'excellent', 'amazing'];
    this.label = labels[this.score];
});

const moodModel = mongoose.model('Mood', moodSchema);
export default moodModel;