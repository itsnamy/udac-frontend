import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/common/NavBar'; 
import Sidebar from './components/common/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Profile from './components/usersPage/Profile';
import AdminDashboard from './components/dashboard/AdminDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import UserList from './components/usersPage/UserList';
import VideoPage from './components/lesson/videos/VideoPage';
import NotePage from './components/lesson/notes/NotePage';
import NoteForm from './components/lesson/notes/NoteForm';
import ExerciseSetList from './components/exercise/ExerciseSetList'; 
import ExerciseSetForm from './components/exercise/ExerciseSetForm';
import ManageExercise from './components/exercise/ManageExercise';
import QuestionSectionForm from './components/exercise/QuestionSectionForm';
import GroupedExerciseSetList from './components/exercise/do/GroupedExerciseSetList';
import ExerciseView from './components/exercise/do/ExerciseView';
import DoExercise from './components/exercise/do/DoExercise';
import LearningMaterialsList from './components/lesson/materialSet/LearningMaterialsList';
import MaterialSetForm from './components/lesson/materialSet/MaterialSetForm';
import ViewMaterialSet from './components/lesson/materialSet/ViewMaterialSet';
import LearningFlowManager from './components/lesson/materialSet/LearningFlowManager';
import TutorialSetList from './components/tutorial/TutorialSetList';
import ManageTutorial from './components/tutorial/ManageTutorial';
import TutorialForm from './components/tutorial/TutorialForm';
import TrySQLTutorial from './components/tutorial/TrySQLTutorial';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <NavBar toggleSidebar={toggleSidebar} />
      <div className="main-container" style={{ display: 'flex' }}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className="content"
          style={{
            flex: 1,
            padding: '20px',
            marginLeft: isSidebarOpen ? '250px' : '50px',
            transition: 'margin-left 0.3s ease-in-out',
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/user-list" element={<UserList />} />

            <Route path="/video/:id" element={<VideoPage />} /> 

            <Route path="/notes/view/:noteId" element={<NotePage />} />
            <Route path="/notes/add/:sectionId" element={<NoteForm onClose={() => window.history.back()} />} />
            <Route path="/notes/edit/:noteId" element={<NoteForm onClose={() => window.history.back()} />} />
              
            <Route path="/learning-materials" element={<LearningMaterialsList />} />
            <Route path="/material/set/add" element={<MaterialSetForm />} />
            <Route path="/material/set/edit/:id" element={<MaterialSetForm />} />
            <Route path="/material/set/view/:id" element={<ViewMaterialSet />} />  
            <Route path="/learning/flow/:materialIndex" element={<LearningFlowManager />} />


            <Route path="/exercise-sets" element={<ExerciseSetList/>} />
            <Route path="/exercise-sets/:idSet" element={<ManageExercise />} />
            <Route path="/exercise-sets/add" element={<ExerciseSetForm />} />
            <Route path="/exercise-sets/add/:topicTitle?" element={<ExerciseSetForm />} />
            <Route path="/exercise-sets/edit/:idSet" element={<ExerciseSetForm />} />
            <Route path="/exercise-section/add/:idSet" element={<QuestionSectionForm />} />
            <Route path="/exercise-section/edit/:idSet/:idSection" element={<QuestionSectionForm />} />
            <Route path="/exercises/available" element={<GroupedExerciseSetList />} />
            <Route path="/exercises/view/:idExerciseSet" element={<ExerciseView />} />
            <Route path="/exercises/do/:idExerciseSet" element={<DoExercise />} />

            <Route path="/sql-tutorial/list" element={<TutorialSetList />} />
            <Route path="/sql-tutorial/:id" element={<ManageTutorial />} />
            <Route path="/sql-tutorial/try/:id" element={<TrySQLTutorial />} />
            <Route path="/sql-tutorial/add" element={<TutorialForm />} />
            <Route path="/sql-tutorial/edit/:id" element={<TutorialForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
