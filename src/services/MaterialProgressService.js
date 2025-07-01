import axios from "axios";

const BASE_URL = "http://localhost:8080/material/progress";

export const recordProgress = async (studentId, materialSetId, materialId, materialType, token) => {
  const params = { studentId, materialSetId, materialId, materialType };
  const response = await axios.post(`${BASE_URL}/add`, null, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const checkMaterialCompleted = async (studentId, materialId, token) => {
  const response = await axios.get(`${BASE_URL}/status`, {
    params: { studentId, materialId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getStudentMaterialProgress = async (studentId, token) => {
  const response = await axios.get(`${BASE_URL}/completion/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
