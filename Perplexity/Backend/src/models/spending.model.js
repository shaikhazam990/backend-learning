import mongoose from 'mongoose';

const spendingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: { type: Number, required: true },
    category: {
        type: String,
        enum: ['food', 'transport', 'entertainment', 'health', 'shopping', 'bills', 'education', 'other'],
        required: true
    },
    description: { type: String, trim: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    currency: { type: String, default: 'INR' }
}, { timestamps: true });

const spendingModel = mongoose.model('Spending', spendingSchema);
export default spendingModel;