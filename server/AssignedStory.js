import mongoose from 'mongoose';

const AssignedStorySchema = new mongoose.Schema({
  user_story_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserStory',
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
});

const AssignedStory = mongoose.model('AssignedStory', AssignedStorySchema);
export default AssignedStory;
