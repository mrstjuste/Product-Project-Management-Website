import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://kingst2003:YddlxkhMFHuY1bah@cluster0.4swrt.mongodb.net/lab3', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Import models
import Project from './Projects.js';
import User from './Users.js'; // Make sure UserSchema.js exports the User model
import Team from './Teams.js';

// Signup Route
app.post('/signup', async (req, res) => {
    const { firstName, lastName, username, password } = req.body;
    console.log(`Received signup attempt: Username=${username}`);

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create and save new user
        const newUser = new User({ firstName, lastName, username, password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Received login attempt: Username=${username}`);

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            console.log(`Login failed: Invalid credentials for Username=${username}`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Successful login
        console.log(`Login successful for Username=${username}`);
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Existing routes for teams and projects
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
