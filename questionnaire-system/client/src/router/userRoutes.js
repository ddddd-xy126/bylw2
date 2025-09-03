import UserLayout from "@/layouts/UserLayout.vue";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/user/Register.vue";
import ResetPassword from "@/views/user/ResetPassword.vue";
import SurveyDetail from "@/views/user/SurveyDetail.vue";
import QuestionnaireDetail from "@/views/user/SurveyAnswer.vue";
import SurveyResult from "@/views/user/SurveyResult.vue";
import RankingsLayout from "@/views/user/rankings/RankingsLayout.vue";
import Category from "@/views/Category.vue";
import Participation from "@/views/user/rankings/Participation.vue";
import Rating from "@/views/user/rankings/Rating.vue";
import UserPoints from "@/views/user/rankings/UserPoints.vue";
import ProfileLayout from "@/views/user/profile/ProfileLayout.vue";
import Info from "@/views/user/profile/Info.vue";
import Creations from "@/views/user/profile/Creations.vue";
import CreationEditor from "@/views/user/profile/CreationEditor.vue";
import History from "@/views/user/History.vue";
import Collections from "@/views/user/profile/Collections.vue";
import Achievements from "@/views/user/profile/Achievements.vue";
import Reports from "@/views/user/profile/Reports.vue";

export default [
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/reset-password", component: ResetPassword },
  {
    path: "/",
    component: UserLayout,
    children: [
      { path: "", redirect: "/home" },
      { path: "home", component: Home },
      { path: "category", component: Category },
      { path: "surveys/:id", component: SurveyDetail },
      { path: "surveys/answer/:id", component: QuestionnaireDetail },
      { path: "surveys/result/:recordId", component: SurveyResult },
      {
        path: "rankings",
        component: RankingsLayout,
        children: [
          { path: "", redirect: "/rankings/participation" },
          { path: "participation", component: Participation },
          { path: "rating", component: Rating },
          { path: "user-points", component: UserPoints },
        ],
      },
      {
        path: "profile",
        component: ProfileLayout,
        meta: { requiresAuth: true },
        children: [
          { path: "", redirect: "/profile/info" },
          { path: "info", component: Info },
          { path: "creations", component: Creations },
          { path: "creations/editor", component: CreationEditor },
          { path: "history", component: History },
          { path: "collections", component: Collections },
          { path: "achievements", component: Achievements },
          { path: "reports", component: Reports },
        ],
      },
    ],
  },
];
