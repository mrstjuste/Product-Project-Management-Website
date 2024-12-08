import mongoose from 'mongoose';

const UserStorySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserStory = mongoose.model('UserStory', UserStorySchema, 'user_stories');

export default UserStory;
