import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const uploadPaper = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/papers/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const analyzePaper = (paperId) => api.post(`/papers/${paperId}/analyze`);
export const getPaper = (paperId) => api.get(`/papers/${paperId}`);
export const paperFileUrl = (paperId) => `/api/papers/${paperId}/file`;
export const listPapers = () => api.get("/papers");
export const searchPaper = (paperId, q) => api.get(`/search/${paperId}`, { params: { q } });
export const exportUrl = (paperId, format) => `/api/export/${paperId}/${format}`;

export default api;
