import UserLayout from "@/layouts/UserLayout.vue";
import HomePage from "@/views/home/HomePage.vue";
import LoginPage from "@/views/auth/LoginPage.vue";
import RegisterPage from "@/views/auth/RegisterPage.vue";
import ResetPasswordPage from "@/views/auth/ResetPasswordPage.vue";
import SurveyDetailPage from "@/views/survey/DetailPage.vue";
import SurveyAnswerPage from "@/views/survey/AnswerPage.vue";
import SurveyResultPage from "@/views/survey/ResultPage.vue";
import RankingsLayout from "@/views/user/RankingsLayout.vue";
import CategoryPage from "@/views/common/CategoryPage.vue";
import ForumPage from "@/views/common/ForumPage.vue";
import ParticipationPage from "@/views/user/components/rankings/ParticipationPage.vue";
import RatingPage from "@/views/user/components/rankings/RatingPage.vue";
import UserPointsPage from "@/views/user/components/rankings/UserPointsPage.vue";
import ProfileLayout from "@/views/user/ProfileLayout.vue";
import InfoPage from "@/views/user/components/profile/InfoPage.vue";
import CreationsPage from "@/views/user/components/profile/CreationsPage.vue";
import CreationEditor from "@/views/user/components/profile/CreationEditor.vue";
import HistoryPage from "@/views/user/HistoryPage.vue";
import CollectionsPage from "@/views/user/components/profile/CollectionsPage.vue";
import AchievementsPage from "@/views/user/components/profile/AchievementsPage.vue";
import ReportsPage from "@/views/user/components/profile/ReportsPage.vue";
import CreateQuestionnairePage from "@/views/questionnaire/CreatePage.vue";
import TemplateSelectionPage from "@/views/questionnaire/TemplateSelectionPage.vue";
import CustomCreatePage from "@/views/questionnaire/CustomCreatePage.vue";

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
          { path: "creations", component: CreationsPage },
          { path: "creations/editor", component: CreationEditor },
          { path: "history", component: HistoryPage },
          { path: "collections", component: CollectionsPage },
          { path: "achievements", component: AchievementsPage },
          { path: "reports", component: ReportsPage },
        ],
      },
      { path: "create", component: CreateQuestionnairePage, meta: { requiresAuth: true } },
      { path: "create/templates", component: TemplateSelectionPage, meta: { requiresAuth: true } },
      { path: "create/custom", component: CustomCreatePage, meta: { requiresAuth: true } },
    ],
  },
];
