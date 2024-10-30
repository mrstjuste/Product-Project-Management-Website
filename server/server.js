import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// dont forget to add the mongodb+srv://@cluster0.4swrt.mongodb.net/lab3
mongoose.connect('', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

import Project from './Projects.js';
import User from './Users.js';
import Team from './Teams.js';

app.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create user' });
    }
});

app.post('/createTeam', async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.status(201).send(team);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create team' });
    }
});

app.post('/createProject', async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).send(project);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create project' });
    }
});

app.get('/getUsers', async (req, res) => {
    try {
        const users = await User.find({}, { firstName: 1, lastName: 1 });
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch users' });
    }
});

app.get('/getTeams', async (req, res) => {
    try {
        const teams = await Team.find();
        res.send(teams);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch teams' });
    }
});

app.get('/getProjects', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('mgr_id', 'firstName lastName')         
            .populate('prod_owner_id', 'firstName lastName')   
            .populate('team_id', 'team_name');                

        const responseDetails = projects.map(project => ({
            project_name: project.proj_name,
            description: project.proj_desc,
            manager_details: project.mgr_id,
            owner_details: project.prod_owner_id,
            team_details: project.team_id
        }));

        res.send(responseDetails);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send(error);
    }
});


  

app.listen(9000, () => {
    console.log('Server is running on port 9000');
});
