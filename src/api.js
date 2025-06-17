import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // 배포 백엔드 주소소
});

export default api;
