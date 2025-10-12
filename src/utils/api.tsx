import ky from "ky";

const api = ky.create({
  prefixUrl: "/api",
  timeout: 10000,
});

export default api;
