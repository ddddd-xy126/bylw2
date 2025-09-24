import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    profile: (() => {
      const profileData = localStorage.getItem("profile");
      if (!profileData || profileData === "undefined") {
        return null;
      }
      try {
        return JSON.parse(profileData);
      } catch {
        return null;
      }
    })(),
    favorites: [],
    answers: [],
    achievements: null,
    reports: [],
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.profile?.role === "admin",
    userName: (state) => state.profile?.nickname || "用户",
  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    setProfile(profile) {
      this.profile = profile;
      localStorage.setItem("profile", JSON.stringify(profile));
    },
    setUserData(data) {
      this.favorites = Array.isArray(data.favorites) ? data.favorites : [];
      this.answers = Array.isArray(data.answers) ? data.answers : [];
      this.achievements = data.achievements;
      this.reports = Array.isArray(data.reports) ? data.reports : [];
    },
    logout() {
      this.token = "";
      this.profile = null;
      this.favorites = [];
      this.answers = [];
      this.achievements = null;
      this.reports = [];
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
    },
  },
});
