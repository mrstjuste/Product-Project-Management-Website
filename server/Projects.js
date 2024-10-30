// models/projects.js
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  proj_name: String,
  proj_desc: String,
  prod_owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mgr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
});


const Project = mongoose.model('Project', ProjectSchema);

export default Project;
