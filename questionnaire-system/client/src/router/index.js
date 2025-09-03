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

  // protect routes that require authentication
  if (to.meta?.requiresAuth && !token) {
    const redirect = to.meta?.requiresAdmin ? "/admin/login" : "/login";
    return next(redirect);
  }

  // ensure admin-only routes are restricted
  if (to.meta?.requiresAdmin && role !== "admin") {
    return next("/403");
  }

  // if logged-in user is admin and tries to access public front pages, redirect to admin dashboard
  if (token && role === "admin") {
    const frontPaths = ["/", "/home", "/login", "/register"];
    if (frontPaths.includes(to.path)) {
      return next("/admin/dashboard");
    }
  }

  next();
});

export default router;
