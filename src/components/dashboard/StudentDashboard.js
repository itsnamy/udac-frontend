import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {BookOpen, Dumbbell, Code, Eye, ClipboardList} from 'lucide-react';
import './AdminDashboard.css';
import logo from '../assets/UDac-logo-background.png';
import API_BASE from '../../config';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [thematicExercises, setThematicExercises] = useState([]);
  const [cumulativeExercises, setCumulativeExercises] = useState([]);
  const [tutorials, setTutorials] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const fetchData = useCallback(async () => {
    try {
      const [matRes, exRes, tutRes] = await Promise.all([
        axios.get(`${API_BASE}/material/set/view/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/exercise/sets/view/grouped-by-section`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/tutorial/set/all`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setMaterials(matRes.data);
      const allExercises = Object.values(exRes.data).flat();
      setExercises(allExercises);
      setThematicExercises(allExercises.filter(e => e.exerciseType === 'THEMATIC'));
      setCumulativeExercises(allExercises.filter(e => e.exerciseType === 'CUMULATIVE'));
      setTutorials(tutRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalThematic = exercises.filter(ex => ex.exerciseType === 'THEMATIC').length;
  const totalCumulative = exercises.filter(ex => ex.exerciseType === 'CUMULATIVE').length;

  const filteredMaterials = materials.filter(m => m.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredThematicExercises = thematicExercises.filter(e =>e.exerciseTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  const groupedThematic = filteredThematicExercises.reduce((acc, ex) => {
    if (!acc[ex.exerciseSection]) {
      acc[ex.exerciseSection] = [];
    }
    acc[ex.exerciseSection].push(ex);
    return acc;
  }, {});  
  const filteredCumulativeExercises = cumulativeExercises.filter(e =>e.exerciseTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTutorials = tutorials.filter(t => t.tutorialTitle.toLowerCase().includes(searchTerm.toLowerCase()));

  const ContentCard = ({ item, type, onView}) => (
    <div className="content-card">
      <div className="card-image">
        {type === 'materials' && <BookOpen size={32} />}
        {type === 'thematic' && <ClipboardList size={32} />}
        {type === 'cumulative' && <Dumbbell size={32} />}
        {type === 'tutorials' && <Code size={32} />}
      </div>
      <h3 className="card-title">{item.topicTitle || item.exerciseTitle || item.tutorialTitle}</h3>
      <div className="card-actions">
        <button onClick={() => onView(item.idMaterialSet || item.idExerciseSet || item.idTutorialSet)} className="btn btn-view"><Eye size={16} /> Lihat</button>
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
          <div className="widget-card">
            <BookOpen size={32} />
            <h3>Jumlah Bahan</h3>
            <div className="widget-stat">{materials.length}</div>
          </div>
          <div className="widget-card">
            <ClipboardList size={32} />
            <h3>Jumlah Latihan Tematik</h3>
            <div className="widget-stat">{totalThematic}</div>
          </div>
          <div className="widget-card">
            <Dumbbell size={32} />
            <h3>Jumlah Latihan Kumulatif</h3>
            <div className="widget-stat">{totalCumulative}</div>
          </div>
          <div className="widget-card">
            <Code size={32} />
            <h3>Jumlah Tutorial</h3>
            <div className="widget-stat">{tutorials.length}</div>
          </div>
        </div>

        <div className="content-tabs-container">
          <div className="tab-navigation">
            <button className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}><BookOpen size={16} /> Bahan Pembelajaran</button>
            <button className={`tab-button ${activeTab === 'thematic' ? 'active' : ''}`} onClick={() => setActiveTab('thematic')}><ClipboardList size={16} /> Latihan Tematik</button>
            <button className={`tab-button ${activeTab === 'cumulative' ? 'active' : ''}`} onClick={() => setActiveTab('cumulative')}><Dumbbell size={16} /> Latihan Kumulatif</button>
            <button className={`tab-button ${activeTab === 'tutorials' ? 'active' : ''}`} onClick={() => setActiveTab('tutorials')}><Code size={16} /> Tutorial</button>
          </div>

          <div className="tab-content">

            {activeTab === 'materials' && (
              <div>
                <div className="section-header">
                  <h2>Bahan Pempelajaran</h2>
                </div>
                <div className="content-grid">
                  {filteredMaterials.map(mat => (
                    <ContentCard
                      key={mat.idMaterialSet}
                      item={mat}
                      type="materials"
                      onView={() => navigate(`/material/set/view/${mat.idMaterialSet}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'thematic' && (
              <div>
                <div className="section-header">
                  <h2>Latihan Tematik</h2>
                </div>
                <div className="content-grouped">
                  {Object.entries(groupedThematic).map(([sectionTitle, sectionExercises]) => (
                    <div key={sectionTitle} className="exercise-section-block">
                      <h3 style={{ marginBottom: '12px', color: '#333' }}>{sectionTitle}</h3>
                      <div className="content-grid">
                        {sectionExercises.map(ex => (
                          <ContentCard
                            key={ex.idExerciseSet}
                            item={ex}
                            type="thematic"
                            onView={() => navigate(`/exercises/view/${ex.idExerciseSet}`)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cumulative' && (
              <div>
                <div className="section-header">
                  <h2>Latihan Kumulatif</h2>
                </div>
                <div className="content-grid">
                  {filteredCumulativeExercises.map(ex => (
                    <ContentCard
                      key={ex.idExerciseSet}
                      item={ex}
                      type="cumulative"
                      onView={() => navigate(`/exercises/view/${ex.idExerciseSet}`)}
                    />
                  ))}
                </div>
              </div>
            )}


            {activeTab === 'tutorials' && (
              <div>
                <div className="section-header">
                  <h2>Tutorial SQL</h2>
                </div>
                <div className="content-grid">
                  {filteredTutorials.map(tut => (
                    <ContentCard
                      key={tut.idTutorialSet}
                      item={tut}
                      type="tutorials"
                      onView={() => navigate(`/sql-tutorial/${tut.idTutorialSet}`)}
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

export default StudentDashboard;
