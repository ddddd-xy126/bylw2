import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminLoginPage from "@/views/backend/admin/LoginPage.vue";
import DashboardPage from "@/views/backend/admin/DashboardPage.vue";
import UserManagePage from "@/views/backend/admin/components/users/UserManagePage.vue";
import AdminManagePage from "@/views/backend/admin/components/users/AdminManagePage.vue";
import CreateUserPage from "@/views/backend/admin/components/users/CreateUserPage.vue";
import SurveyListPage from "@/views/backend/admin/components/surveys/SurveyListPage.vue";
import SurveyEditorPage from "@/views/backend/admin/components/surveys/SurveyEditorPage.vue";
import SurveyReviewPage from "@/views/backend/admin/components/surveys/SurveyReviewPage.vue";
import CompletionPage from "@/views/backend/admin/components/statistics/CompletionPage.vue";
import DistributionPage from "@/views/backend/admin/components/statistics/DistributionPage.vue";
import QuestionManagePage from "@/views/backend/admin/components/questions/QuestionManagePage.vue";
import QuestionnaireListPage from "@/views/backend/admin/components/questionnaires/QuestionnaireListPage.vue";
import PendingQuestionnairesPage from "@/views/backend/admin/components/questionnaires/PendingQuestionnairesPage.vue";
import AnnouncementManagePage from "@/views/backend/admin/components/announcements/AnnouncementManagePage.vue";
import AdminProfilePage from "@/views/backend/admin/components/profile/AdminProfilePage.vue";

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
      { path: "questionnaires/list", component: QuestionnaireListPage },
      { path: "questionnaires/pending", component: PendingQuestionnairesPage },
      { path: "announcements", component: AnnouncementManagePage },
      { path: "profile", component: AdminProfilePage },
      { path: "statistics/completion", component: CompletionPage },
      { path: "statistics/distribution", component: DistributionPage },
    ],
  },
];
