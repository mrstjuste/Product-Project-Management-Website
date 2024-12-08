// /src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import ViewTeams from './Pages/ViewTeams';
import ViewProjects from './Pages/ViewProjects';
import CreateProject from './Pages/CreateProject';
import CreateTeam from './Pages/CreateTeam';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/view-projects" element={<ViewProjects />} />
        <Route path="/view-teams" element={<ViewTeams />} />
        <Route path="/create-team" element={<CreateTeam />} />

      </Routes>
    </Router>
  );
};

export default App;
