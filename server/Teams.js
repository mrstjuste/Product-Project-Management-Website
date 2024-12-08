import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
    team_name: {
        type: String,
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
        },
    ],
});

const Team = mongoose.model('Team', TeamSchema);
export default Team;
