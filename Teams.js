import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  team_name: String
}, { collection: 'teams' }); 

const Team = mongoose.model('Team', TeamSchema);

export default Team;
