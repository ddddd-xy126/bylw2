// 聚合导出各模块 store
export * from "./user";
export * from "./questionnaire";

// 便捷函数：一次性获取所有常用 store 实例
import { useUserStore } from "./user";
import { useQuestionnaireStore } from "./questionnaire";
import { getProfile } from "@/api/auth";

export function useStores() {
  return {
    user: useUserStore(),
    questionnaire: useQuestionnaireStore(),
  };
}

// 在应用启动或路由切换时调用，确保登录状态下的用户资料已拉取
export async function ensureUserProfileLoaded() {
  const userStore = useUserStore();
  if (userStore.token && !userStore.profile) {
    try {
      const profile = await getProfile();
      userStore.setProfile(profile);
    } catch (e) {
      // 静默失败：令牌过期/接口异常不打断页面
    }
  }
}
