const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a board name'],
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  color: {
    type: String,
    default: '#6B7280'
  }
}, {
  timestamps: true
});

// Index for faster queries
boardSchema.index({ project: 1, position: 1 });

module.exports = mongoose.model('Board', boardSchema);
