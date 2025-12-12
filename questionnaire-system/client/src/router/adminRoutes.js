import AdminLayout from "@/layouts/AdminLayout.vue";
import LoginPage from "@/views/frontend/auth/LoginPage.vue";
import DashboardPage from "@/views/backend/admin/DashboardPage.vue";
import UserManagePage from "@/views/backend/admin/components/users/UserManagePage.vue";
import CreateUserPage from "@/views/backend/admin/components/users/CreateUserPage.vue";
import QuestionnaireListPage from "@/views/backend/admin/components/questionnaires/QuestionnaireListPage.vue";
import PendingQuestionnairesPage from "@/views/backend/admin/components/questionnaires/PendingQuestionnairesPage.vue";
// 使用统一的问卷编辑器组件
import QuestionnaireEditor from "@/components/QuestionnaireEditor.vue";
import AnnouncementManagePage from "@/views/backend/admin/components/announcements/AnnouncementManagePage.vue";
import AdminProfilePage from "@/views/backend/admin/components/profile/AdminProfilePage.vue";

export default [
  { path: "/admin/login", component: LoginPage, meta: { isAdminLogin: true } },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "dashboard", component: DashboardPage },
      { path: "admins/create", component: CreateUserPage },
      { path: "users", component: UserManagePage },
      { path: "questionnaires/list", component: QuestionnaireListPage },
      { path: "questionnaires/create", component: QuestionnaireEditor },
      { path: "questionnaires/edit/:id", component: QuestionnaireEditor },
      { path: "questionnaires/pending", component: PendingQuestionnairesPage },
      { path: "announcements", component: AnnouncementManagePage },
      { path: "profile", component: AdminProfilePage },
    ],
  },
];
