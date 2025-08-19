import request from "./index";

export const loginApi = (data) => request.post("/user/login", data);
export const registerApi = (data) => request.post("/user/register", data);
export const profileApi = () => request.get("/user/profile");
