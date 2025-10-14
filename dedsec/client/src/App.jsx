import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CTFTracker from './pages/CTFTracker';
import Writeups from './pages/Writeups';
import Announcements from './pages/Announcements';
import Community from './pages/Community';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ctf" element={<CTFTracker />} />
        <Route path="/writeups" element={<Writeups />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </Router>
  );
}

export default App;