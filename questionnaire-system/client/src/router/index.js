import { createRouter, createWebHistory } from "vue-router";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";
import Forbidden from "@/views/error/403.vue";
import NotFound from "@/views/error/404.vue";

const routes = [
  ...userRoutes,
  ...adminRoutes,
  { path: "/403", component: Forbidden },
  { path: "/:pathMatch(.*)*", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  const profileRaw = localStorage.getItem("profile");
  const profile = profileRaw ? JSON.parse(profileRaw) : null;
  const role = profile?.role;

  if (to.meta?.requiresAuth && !token) {
    const redirect = to.meta?.requiresAdmin ? "/admin/login" : "/login";
    return next(redirect);
  }
  if (to.meta?.requiresAdmin && role !== "admin") {
    return next("/403");
  }
  next();
});

export default router;
