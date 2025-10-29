// models/Task.js - Task Schema
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Task description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    assignedTo: {
        type: String,
        required: [true, 'Assigned member name is required'],
        trim: true
    },
    assignedToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task creator is required']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
        validate: {
            validator: function (v) {
                return v > new Date();
            },
            message: 'Deadline must be in the future'
        }
    },
    status: {
        type: String,
        enum: ['available', 'ongoing', 'completed', 'rejected', 'overdue'],
        default: 'available'
    },
    rejectionReason: {
        type: String,
        default: null,
        maxlength: [200, 'Rejection reason cannot exceed 200 characters'],
        validate: {
            validator: function (v) {
                return this.status === 'rejected' ? !!v : true;
            },
            message: 'Rejection reason is required when status is rejected'
        }
    },
    acceptedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for better query performance
taskSchema.index({ status: 1, deadline: 1 });
taskSchema.index({ assignedToUser: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);