import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, BookOpen, Dumbbell, Code, Plus, Eye, Edit, Activity
} from 'lucide-react';
import './AdminDashboard.css';
import logo from '../assets/UDac-logo-background.png';
import API_BASE from '../../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [materials, setMaterials] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [users, setUsers] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const fetchData = useCallback(async () => {
    try {
      const [matRes, exRes, tutRes, userRes] = await Promise.all([
        axios.get(`${API_BASE}/material/set/view/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/exercise/sets/view/grouped-by-section`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/tutorial/set/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/admin/getAllUser`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setMaterials(matRes.data);
      setExercises(Object.values(exRes.data).flat());
      setTutorials(tutRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalExercises = Object.values(exercises).flat().length;
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;

  const filteredMaterials = materials.filter(m => m.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredExercises = exercises.filter(e => e.exerciseTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTutorials = tutorials.filter(t => t.tutorialTitle.toLowerCase().includes(searchTerm.toLowerCase()));

  const ContentCard = ({ item, type, onView, onEdit}) => (
    <div className="content-card">
      <div className="card-image">
        {type === 'materials' && <BookOpen size={32} />}
        {type === 'exercises' && <Dumbbell size={32} />}
        {type === 'tutorials' && <Code size={32} />}
      </div>
      <h3 className="card-title">{item.topicTitle || item.exerciseTitle || item.tutorialTitle}</h3>
      <div className="card-actions">
        <button onClick={() => onView(item.idMaterialSet || item.idExerciseSet || item.idTutorialSet)} className="btn btn-view"><Eye size={16} /> Lihat</button>
        <button onClick={() => onEdit(item.idMaterialSet || item.idExerciseSet || item.idTutorialSet)} className="btn btn-edit"><Edit size={16} /> Kemaskini</button>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <img src={logo} alt="UDaC Logo"  />
        </div>

        {/* Summary Widgets */}
        <div className="widget-grid">
          <div className="widget-card"><Users size={32} />
            <h3>Jumlah Pelajar</h3>
            <div className="widget-stat">{totalStudents}</div>
          </div>
          <div className="widget-card">
            <BookOpen size={32} />
            <h3>Jumlah Bahan</h3>
            <div className="widget-stat">{materials.length}</div>
          </div>
          <div className="widget-card">
            <Dumbbell size={32} />
            <h3>Jumlah Latihan</h3>
            <div className="widget-stat">{exercises.length}</div>
          </div>
          <div className="widget-card">
            <Code size={32} />
            <h3>Jumlah Tutorial</h3>
            <div className="widget-stat">{tutorials.length}</div>
          </div>
        </div>

        <div className="content-tabs-container">
          <div className="tab-navigation">
            <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Activity size={16} /> Ringkasan</button>
            <button className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}><BookOpen size={16} /> Bahan Pembelajaran</button>
            <button className={`tab-button ${activeTab === 'exercises' ? 'active' : ''}`} onClick={() => setActiveTab('exercises')}><Dumbbell size={16} /> Latihan</button>
            <button className={`tab-button ${activeTab === 'tutorials' ? 'active' : ''}`} onClick={() => setActiveTab('tutorials')}><Code size={16} /> Tutorial</button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="overview-grid">
                  <div className="quick-actions-card">
                    <h3>Capaian segera</h3>
                    <div className="quick-actions-grid">
                      <button className="quick-action-btn" onClick={() => navigate('/learning-materials')}>Lihat Bahan</button>
                      <button className="quick-action-btn" onClick={() => navigate('/exercise-sets')}>Lihat Latihan</button>
                      <button className="quick-action-btn" onClick={() => navigate('/sql-tutorial/list')}>Lihat Latihan</button>
                      <button className="quick-action-btn" onClick={() => navigate('/user-list')}>Lihat Pengguna</button>
                    </div>
                  </div>
                  <div className="recent-activity-card">
                    <h3>Aktiviti Terkini</h3>
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-dot green"></div>
                        <span>Bahan Pembelajaran</span>
                        <span className="activity-time">{materials.length}</span>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot blue"></div>
                        <span>Latihan</span>
                        <span className="activity-time">{totalExercises}</span>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot purple"></div>
                        <span>Tutorial SQL</span>
                        <span className="activity-time">{tutorials.length}</span>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot purple"></div>
                        <span>Pelajar</span>
                        <span className="activity-time">{totalStudents}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div>
                <div className="section-header">
                  <h2>Bahan Pempelajaran</h2>
                  <button className="btn btn-primary" onClick={() => navigate('/material/set/add')}><Plus size={16} /> Tambah Bahan</button>
                </div>
                <div className="content-grid">
                  {filteredMaterials.map(mat => (
                    <ContentCard
                      key={mat.idMaterialSet}
                      item={mat}
                      type="materials"
                      onView={() => navigate(`/material/set/view/${mat.idMaterialSet}`)}
                      onEdit={() => navigate(`/material/set/edit/${mat.idMaterialSet}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'exercises' && (
              <div>
                <div className="section-header">
                  <h2>Latihan</h2>
                  <button className="btn btn-primary" onClick={() => navigate('/exercise-sets/add')}><Plus size={16} /> Tambah Latihan</button>
                </div>
                <div className="content-grid">
                  {filteredExercises.map(ex => (
                    <ContentCard
                      key={ex.idExerciseSet}
                      item={ex}
                      type="exercises"
                      onView={() => navigate(`/exercise-sets/${ex.idExerciseSet}`)}
                      onEdit={() => navigate(`/exercise-sets/edit/${ex.idExerciseSet}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tutorials' && (
              <div>
                <div className="section-header">
                  <h2>Tutorial SQL</h2>
                  <button className="btn btn-primary" onClick={() => navigate('/sql-tutorial/add')}><Plus size={16} /> Tambah Tutorial</button>
                </div>
                <div className="content-grid">
                  {filteredTutorials.map(tut => (
                    <ContentCard
                      key={tut.idTutorialSet}
                      item={tut}
                      type="tutorials"
                      onView={() => navigate(`/sql-tutorial/${tut.idTutorialSet}`)}
                      onEdit={() => navigate(`/sql-tutorial/edit/${tut.idTutorialSet}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
