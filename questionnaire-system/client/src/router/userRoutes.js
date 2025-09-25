import UserLayout from "@/layouts/UserLayout.vue";
import HomePage from "@/views/frontend/home/HomePage.vue";
import LoginPage from "@/views/frontend/auth/LoginPage.vue";
import RegisterPage from "@/views/frontend/auth/RegisterPage.vue";
import ResetPasswordPage from "@/views/frontend/auth/ResetPasswordPage.vue";
import SurveyDetailPage from "@/views/frontend/survey/DetailPage.vue";
import SurveyAnswerPage from "@/views/frontend/survey/AnswerPage.vue";
import SurveyResultPage from "@/views/frontend/survey/ResultPage.vue";
import RankingsLayout from "@/views/frontend/rankings/RankingsLayout.vue";
import ForumPage from "@/views/common/ForumPage.vue";
import ParticipationPage from "@/views/frontend/rankings/ParticipationPage.vue";
import RatingPage from "@/views/frontend/rankings/RatingPage.vue";
import UserPointsPage from "@/views/frontend/rankings/UserPointsPage.vue";
import ProfileLayout from "@/views/frontend/user/ProfileLayout.vue";
import InfoPage from "@/views/frontend/user/components/profile/InfoPage.vue";
import CreationsPage from "@/views/frontend/user/components/profile/CreationsPage.vue";
import CreationEditor from "@/views/frontend/user/components/profile/CreationEditor.vue";
import HistoryPage from "@/views/frontend/user/HistoryPage.vue";
import CollectionsPage from "@/views/frontend/user/components/profile/CollectionsPage.vue";
import AchievementsPage from "@/views/frontend/user/components/profile/AchievementsPage.vue";
import ReportsPage from "@/views/frontend/user/components/profile/ReportsPage.vue";
import CreateQuestionnairePage from "@/views/frontend/questionnaire/CreatePage.vue";
import TemplateSelectionPage from "@/views/frontend/questionnaire/TemplateSelectionPage.vue";
import CustomCreatePage from "@/views/frontend/questionnaire/CustomCreatePage.vue";
import AnsweredPage from "@/views/frontend/user/components/questionnaires/AnsweredPage.vue";
import CreatedPage from "@/views/frontend/user/components/questionnaires/CreatedPage.vue";
import PendingPage from "@/views/frontend/user/components/questionnaires/PendingPage.vue";
import PublishedPage from "@/views/frontend/user/components/questionnaires/PublishedPage.vue";
import TrashPage from "@/views/frontend/user/components/questionnaires/TrashPage.vue";

export default [
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/reset-password", component: ResetPasswordPage },
  {
    path: "/",
    component: UserLayout,
    children: [
      { path: "", redirect: "/home" },
      { path: "home", component: HomePage },
      { path: "forum", component: ForumPage },
      { path: "surveys/:id", component: SurveyDetailPage },
      { path: "surveys/answer/:id", component: SurveyAnswerPage },
      { path: "surveys/result/:recordId", component: SurveyResultPage },
      {
        path: "rankings",
        component: RankingsLayout,
        children: [
          { path: "", redirect: "/rankings/participation" },
          { path: "participation", component: ParticipationPage },
          { path: "rating", component: RatingPage },
          { path: "user-points", component: UserPointsPage },
        ],
      },
      {
        path: "profile",
        component: ProfileLayout,
        meta: { requiresAuth: true },
        children: [
          { path: "", redirect: "/profile/info" },
          { path: "info", component: InfoPage },
          { path: "collections", component: CollectionsPage },
          { path: "history", component: HistoryPage },
          { path: "questionnaires/answered", component: AnsweredPage },
          { path: "questionnaires/created", component: CreatedPage },
          { path: "questionnaires/pending", component: PendingPage },
          { path: "questionnaires/published", component: PublishedPage },
          { path: "questionnaires/trash", component: TrashPage },
          { path: "achievements", component: AchievementsPage },
          { path: "reports", component: ReportsPage },
          // 保留原有的创建页面路由
          { path: "creations", component: CreationsPage },
          { path: "creations/editor", component: CreationEditor },
        ],
      },
      { path: "create", component: CreateQuestionnairePage, meta: { requiresAuth: true } },
      { path: "create/templates", component: TemplateSelectionPage, meta: { requiresAuth: true } },
      { path: "create/custom", component: CustomCreatePage, meta: { requiresAuth: true } },
    ],
  },
];
