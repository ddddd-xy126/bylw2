import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminLogin from "@/views/admin/AdminLogin.vue";
import Dashboard from "@/views/admin/Dashboard.vue";
import UserManagement from "@/views/admin/UserManage.vue";
import AdminManagement from "@/views/admin/AdminManagement.vue";
import SurveyList from "@/views/admin/surveys/SurveyList.vue";
import SurveyEditor from "@/views/admin/surveys/SurveyEditor.vue";
import SurveyReview from "@/views/admin/surveys/SurveyReview.vue";
import Completion from "@/views/admin/statistics/Completion.vue";
import Distribution from "@/views/admin/statistics/Distribution.vue";

export default [
  { path: "/admin/login", component: AdminLogin },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "dashboard", component: Dashboard },
      { path: "admins", component: AdminManagement },
      { path: "users", component: UserManagement },
      { path: "surveys", component: SurveyList },
      { path: "surveys/create", component: SurveyEditor },
      { path: "surveys/edit/:id", component: SurveyEditor },
      { path: "surveys/review", component: SurveyReview },
      { path: "statistics/completion", component: Completion },
      { path: "statistics/distribution", component: Distribution },
    ],
  },
];
