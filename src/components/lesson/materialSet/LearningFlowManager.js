import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { recordProgress } from "../../../services/MaterialProgressService"; 


const LearningFlowManager = () => {
  const { materialIndex } = useParams(); // e.g. 0, 1, 2...
  const navigate = useNavigate();
  const location = useLocation();

  const topicId = location.state?.materialSetId;

  const sequence = useMemo(() => location.state?.sequence || [], [location.state]);
  const index = parseInt(materialIndex);
  const current = Number.isInteger(index) ? sequence[index] : null;

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const recordAndNavigate = async () => {
      if (!current) {
        alert("Kandungan telah tamat atau tidak dijumpai.");
        navigate(`/material/set/view/${topicId}`);
        return;
      }
  
      const nextState = {
        sequence,
        materialIndex: index,
        materialSetId: topicId,
      };
  
      switch (current.type) {
        case "VIDEO":
          navigate(`/video/${current.id}`, { state: nextState });
          break;
        case "NOTE":
          navigate(`/notes/view/${current.id}`, { state: nextState });
          break;
        case "QUIZ":
          navigate(`/exercises/view/${current.id}`, { state: nextState });
          break;
        default:
          alert("Jenis kandungan tidak dikenali.");
          navigate(`/material/set/view/${topicId}`);
      }
    };
  
    recordAndNavigate();
  }, [current, index, navigate, sequence, topicId, user]);
  

  return <p>Memuatkan kandungan...</p>;
};

export default LearningFlowManager;
