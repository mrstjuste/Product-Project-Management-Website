import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://kingst2003:YddlxkhMFHuY1bah@cluster0.4swrt.mongodb.net/lab3', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

import Project from './Projects.js';
import User from './Users.js';
import Team from './Teams.js';
import UserStory from './UserStory.js';
import AssignedStory from './AssignedStory.js';

app.post('/signup', async (req, res) => {
    const { 
        firstName,
         lastName,
          username,
           password } = req.body;
    console.log(`Received signup attempt: Username=${username}`);

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = new User({ 
            firstName,
             lastName, 
             username,
              password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 
            'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = 
    req.body;
    console.log(`Received login attempt: Username=${username}`);

    try {
        const user = await User.findOne({ username });
        if (!user || 
            user.password !== password) {
            console.log(`Login failed: Invalid credentials for Username=${username}`);
            return res.status(400).json({
                 message: 'Invalid username or password' });
        }

        console.log(`Login successful for Username=${username}`);
        res.status(200).json({ 
            message: 'Login successful', user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
             message: 'Internal server error' });
    }
});

app.post('/createTeam', async (req, res) => {
    try {
        const team =
         new Team(req.body);
        await team.save();
        res.status(201).send(team);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create team' });
    }
});

app.post('/createProject', async (req, res) => {
    try {
        const project = 
        new Project(req.body);
        await project.save();
        res.status(201).send(project);
    } catch (error) {
        res.status(500).send({ 
            error: 'Failed to create project' });
    }
});

app.get('/getUsers', async (req, res) => {
    try {
        const users = await
         User.find({}, { firstName: 1, lastName: 1 });
        res.send(users);
    } catch (error) {
        res.status(500).send({
            error: 'Failed to fetch users' });
    }
});

app.get('/getTeams', async (req, res) => {
    try {
        const teams = 
        await Team.find();
        res.send(teams);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch teams' });
    }
});

app.get('/getProjects', async (req, res) => {
    try {
        const projects = await Project.find(); 
        const responseDetails = projects.map(project => ({
            _id: project._id.toString(),
            project_name: project.proj_name || 'Unknown',
            description: project.proj_desc || 'No description available',
        }));
        res.status(200).json(responseDetails);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
});


app.get('/getProjectInformation', async (req, res) => {
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

app.post('/addUserStory', async (req, res) => {
    const { projectId, 
        description,
         priority } = req.body;
    console.log(`Received user story creation for Project ID=${projectId}`);

    try {
        const userStory = new UserStory({
             projectId, description, priority });
        await userStory.save();

        res.status(201).json({
             message: 'User story created successfully', userStory });
    } catch (error) {
        console.error(
            'Error creating user story:', error);
        res.status(500).json({ 
            message: 'Internal server error' });
    }
});


app.get('/getUserStories', async (req, res) => {
    try {
        const userStories = await UserStory.find()
            .populate('projectId', 'proj_name proj_desc');

        const responseDetails = userStories.map(userStory => ({
            user_story_id: userStory._id.toString(), 
            project: {
                project_id: userStory.projectId?._id.toString(), 
                project_name: userStory.projectId?.proj_name || 'Unknown',
                description: userStory.projectId?.proj_desc || 'No description available',
            },
            description: userStory.description,
            priority: userStory.priority,
        }));

        res.status(200).json(responseDetails);
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({ message: 'Failed to fetch user stories' });
    }
});

app.get('/getUnassignedUserStories', async (req, res) => {
    try {
      const assignedStoryIds = await AssignedStory.find().distinct('user_story_id'); // Get all assigned story IDs
      const unassignedStories = await UserStory.find({ _id: { $nin: assignedStoryIds } }).populate('projectId', 'proj_name proj_desc'); // Fetch unassigned stories
      res.status(200).json(unassignedStories);
    } catch (error) {
      console.error('Error fetching unassigned user stories:', error);
      res.status(500).json({ message: 'Failed to fetch unassigned user stories' });
    }
  });

  app.post('/assignUserStory', async (req, res) => {
    const { userId, userStoryId } = req.body;
  
    if (!userId || !userStoryId) {
      return res.status(400).json({ message: 'User ID and User Story ID are required' });
    }
  
    try {
      const existingAssignment = await AssignedStory.findOne({ user_story_id: userStoryId });
      if (existingAssignment) {
        return res.status(400).json({ message: 'User story is already assigned' });
      }
  
      const assignedStory = new AssignedStory({ user_story_id: userStoryId, user_id: userId });
      await assignedStory.save();
  
      res.status(201).json({ message: 'User story assigned successfully', assignedStory });
    } catch (error) {
      console.error('Error assigning user story:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/getUserStoriesByProject/:projectId', async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const userStories = await UserStory.find({ projectId }).populate('projectId', 'proj_name proj_desc');
      res.status(200).json(userStories);
    } catch (error) {
      console.error('Error fetching user stories by project:', error);
      res.status(500).json({ message: 'Failed to fetch user stories by project' });
    }
  });

  app.delete('/deleteUserStory/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await UserStory.findByIdAndDelete(id);
      res.status(200).json({ message: 'User story deleted successfully' });
    } catch (error) {
      console.error('Error deleting user story:', error);
      res.status(500).json({ message: 'Failed to delete user story' });
    }
  });

  app.put('/editUserStory/:id', async (req, res) => {
    const { id } = req.params;
    const { description, priority } = req.body;
  
    try {
      const updatedStory = await UserStory.findByIdAndUpdate(
        id,
        { description, priority },
        { new: true } 
      );
      res.status(200).json({ message: 'User story updated successfully', updatedStory });
    } catch (error) {
      console.error('Error updating user story:', error);
      res.status(500).json({ message: 'Failed to update user story' });
    }
  });

  app.get('/getUserStory/:id', async (req, res) => {
    try {
      const userStory = await UserStory.findById(req.params.id).populate('projectId', 'proj_name proj_desc');
      if (!userStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      res.status(200).json(userStory);
    } catch (error) {
      console.error('Error fetching user story:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/updateUserStory/:id', async (req, res) => {
    const { description, priority } = req.body;
    try {
      const updatedStory = await UserStory.findByIdAndUpdate(
        req.params.id,
        { description, priority },
        { new: true }
      );
      if (!updatedStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      res.status(200).json({ message: 'User story updated successfully', updatedStory });
    } catch (error) {
      console.error('Error updating user story:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
app.post('/addMembersToTeam', async (req, res) => {
    const { teamId, userIds } = req.body;

    if (!teamId || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    try {
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        team.members = [...new Set([...team.members, ...userIds])]; 
        await team.save();

        res.status(200).json({ message: 'Members added to team successfully' });
    } catch (error) {
        console.error('Error adding members to team:', error);
        res.status(500).json({ message: 'Failed to add members to team' });
    }
});

app.get('/getUserTeams', async (req, res) => {
    const { userId } = req.query;
    try {
        const teams = await Team.find({ members: userId });
        res.status(200).json(teams);
    } catch (error) {
        console.error('Error fetching user teams:', error);
        res.status(500).json({ message: 'Failed to fetch user teams' });
    }
});

app.get('/getUserProjects', async (req, res) => {
    const { userId } = req.query;
    try {
        const teams = await Team.find({ members: userId }).select('_id');
        const teamIds = teams.map((team) => team._id);
        const projects = await Project.find({ team_id: { $in: teamIds } }); 
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ message: 'Failed to fetch user projects' });
    }
});

app.get('/getUserStoriesAssigned', async (req, res) => {
    const { userId } = req.query;
    try {
        const userStories = await UserStory.find({ assigned_to: userId }) 
            .populate('projectId', 'proj_name proj_desc'); 
        res.status(200).json(userStories);
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({ message: 'Failed to fetch user stories' });
    }
});


  

app.listen(9000, () => {
    console.log('Server is running on port 9000');
});
