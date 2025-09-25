import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminLoginPage from "@/views/admin/LoginPage.vue";
import DashboardPage from "@/views/admin/DashboardPage.vue";
import UserManagePage from "@/views/admin/components/users/UserManagePage.vue";
import AdminManagePage from "@/views/admin/components/users/AdminManagePage.vue";
import CreateUserPage from "@/views/admin/components/users/CreateUserPage.vue";
import SurveyListPage from "@/views/admin/components/surveys/SurveyListPage.vue";
import SurveyEditorPage from "@/views/admin/components/surveys/SurveyEditorPage.vue";
import SurveyReviewPage from "@/views/admin/components/surveys/SurveyReviewPage.vue";
import CompletionPage from "@/views/admin/components/statistics/CompletionPage.vue";
import DistributionPage from "@/views/admin/components/statistics/DistributionPage.vue";
import QuestionManagePage from "@/views/admin/components/questions/QuestionManagePage.vue";

export default [
  { path: "/admin/login", component: AdminLoginPage },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "dashboard", component: DashboardPage },
      { path: "admins", component: AdminManagePage },
      { path: "admins/create", component: CreateUserPage },
      { path: "users", component: UserManagePage },
      { path: "surveys", component: SurveyListPage },
      { path: "surveys/create", component: SurveyEditorPage },
      { path: "surveys/edit/:id", component: SurveyEditorPage },
      { path: "surveys/review", component: SurveyReviewPage },
      { path: "questions", component: QuestionManagePage },
      { path: "statistics/completion", component: CompletionPage },
      { path: "statistics/distribution", component: DistributionPage },
    ],
  },
];
