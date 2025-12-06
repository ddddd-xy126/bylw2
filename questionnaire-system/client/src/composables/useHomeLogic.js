// 首页业务逻辑
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { useDataStore } from "@/store/data";
import { listSurveys, getCategoriesApi } from "@/api/survey";
import { addFavoriteApi, removeFavoriteApi, getFavoritesApi } from "@/api/user";

export function useHomeLogic() {
  const userStore = useUserStore();
  const dataStore = useDataStore();

  // 响应式数据
  const searchQuery = ref("");
  const selectedCategory = ref(null);
  const sortBy = ref("latest");
  const currentPage = ref(1);
  const pageSize = ref(9);
  const loading = ref(false);

  // 计算属性
  const surveys = computed(() => dataStore.surveys);
  const categories = computed(() => dataStore.categories);

  // 过滤和排序逻辑
  const filteredSurveys = computed(() => {
    const surveysArray = Array.isArray(surveys.value) ? surveys.value : [];
    let filtered = surveysArray.filter(
      (survey) => survey.status === "published" && survey.isCollecting !== false
    );

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (survey) =>
          survey.title.toLowerCase().includes(query) ||
          survey.description.toLowerCase().includes(query)
      );
    }

    // 分类过滤
    if (selectedCategory.value) {
      filtered = filtered.filter(
        (survey) => survey.categoryId === selectedCategory.value
      );
    }

    // 排序
    switch (sortBy.value) {
      case "latest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "hot":
        filtered.sort(
          (a, b) => (b.participantCount || 0) - (a.participantCount || 0)
        );
        break;
      case "recommended":
        // 智能推荐：根据用户标签进行相关性推荐
        const userTags = userStore.profile?.tags || [];
        console.log("[推荐系统] 用户标签:", userTags);

        if (userTags && userTags.length > 0) {
          // 有标签时：计算相关性得分
          filtered.forEach((survey) => {
            const surveyTags = survey.tags || [];
            // 计算标签匹配度
            const matchCount = surveyTags.filter((tag) =>
              userTags.includes(tag)
            ).length;
            const tagScore = matchCount / Math.max(userTags.length, 1);

            // 综合评分：标签匹配(50%) + 评分(30%) + 参与人数(20%)
            survey.recommendScore =
              tagScore * 0.5 +
              ((survey.rating || 0) / 5) * 0.3 +
              Math.min(
                (survey.participantCount || survey.participants || 0) / 1000,
                1
              ) *
                0.2;
          });

          // 按推荐得分排序（得分高的在前）
          filtered.sort(
            (a, b) => (b.recommendScore || 0) - (a.recommendScore || 0)
          );

          console.log(
            "[推荐系统] 基于标签匹配推荐，前3个问卷:",
            filtered.slice(0, 3).map((s) => ({
              title: s.title,
              tags: s.tags,
              score: s.recommendScore,
            }))
          );
        } else {
          // 无标签时：随机打乱顺序展示
          filtered = filtered.sort(() => Math.random() - 0.5);
          console.log("[推荐系统] 用户无标签，随机推荐");
        }
        break;
    }

    // 分页
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filtered.slice(start, end);
  });

  // 平台统计数据 - 已发布问卷总数
  const totalSurveys = computed(() => {
    const surveysArray = Array.isArray(surveys.value) ? surveys.value : [];
    console.log("[totalSurveys] 所有问卷数量:", surveysArray.length);
    console.log(
      "[totalSurveys] 问卷状态分布:",
      surveysArray.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {})
    );

    // 统计所有已发布且正在收集的问卷
    const publishedAndCollecting = surveysArray.filter(
      (survey) => survey.status === "published" && survey.isCollecting !== false
    );

    console.log(
      "[totalSurveys] 已发布且收集中的问卷数量:",
      publishedAndCollecting.length
    );

    return publishedAndCollecting.length;
  });

  // 平台统计数据 - 总参与人数
  const totalParticipants = computed(() => {
    const surveysArray = Array.isArray(surveys.value) ? surveys.value : [];
    return surveysArray
      .filter((survey) => survey.status === "published")
      .reduce(
        (sum, survey) =>
          sum + (survey.participantCount || survey.participants || 0),
        0
      );
  });

  // 用户收藏数量
  const userFavorites = computed(() => {
    if (!userStore.isLoggedIn) return 0;
    const favoritesArray = Array.isArray(userStore.favorites)
      ? userStore.favorites
      : [];
    return favoritesArray.length;
  });

  // 用户积分
  const userPoints = computed(() => {
    if (!userStore.isLoggedIn) return 0;
    return userStore.profile?.points || 0;
  });

  // 数据加载
  const loadData = async () => {
    loading.value = true;
    try {
      // 加载问卷列表
      const surveysResponse = await listSurveys();
      console.log("[useHomeLogic] 原始响应:", surveysResponse);
      const surveysData = surveysResponse.success
        ? surveysResponse.data
        : Array.isArray(surveysResponse)
        ? surveysResponse
        : surveysResponse.items || surveysResponse.data || [];

      console.log("[useHomeLogic] 处理后的问卷数据数量:", surveysData?.length);
      console.log(
        "[useHomeLogic] 前5个问卷状态:",
        surveysData
          ?.slice(0, 5)
          .map((s) => ({ id: s.id, title: s.title, status: s.status }))
      );

      dataStore.setSurveys(surveysData);

      // 加载分类数据
      try {
        const categoriesResponse = await getCategoriesApi();
        const categoriesData = categoriesResponse.success
          ? categoriesResponse.data
          : Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse.items || categoriesResponse.data || [];

        dataStore.setCategories(categoriesData);
      } catch (categoryError) {
        console.warn("加载分类数据失败：", categoryError);
      }

      // 如果用户已登录，加载收藏等数据
      if (userStore.isLoggedIn && userStore.profile?.id) {
        try {
          const favoritesResponse = await getFavoritesApi(userStore.profile.id);
          // getFavoritesApi已经处理好数据格式，直接使用
          const favorites = Array.isArray(favoritesResponse)
            ? favoritesResponse
            : [];
          userStore.setUserData({ favorites });
        } catch (favError) {
          console.warn("加载收藏数据失败：", favError);
        }
      }
    } catch (error) {
      ElMessage.error("加载数据失败：" + error.message);
      dataStore.setError(error.message);
    } finally {
      loading.value = false;
    }
  };

  // 工具方法
  const getCategoryName = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category?.name || "未分类";
  };

  const isFavorite = (surveyId) => {
    const favoritesArray = Array.isArray(userStore.favorites)
      ? userStore.favorites
      : [];
    // 兼容两种字段名：questionnaireId 和 surveyId
    return favoritesArray.some(
      (fav) => fav.questionnaireId == surveyId || fav.surveyId == surveyId
    );
  };

  // 收藏操作
  const toggleFavorite = async (surveyId) => {
    if (!userStore.isLoggedIn) {
      ElMessage.warning("请先登录");
      return;
    }

    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("用户信息错误");
      return;
    }

    try {
      if (isFavorite(surveyId)) {
        await removeFavoriteApi(userId, surveyId);
        userStore.removeFavorite(surveyId);
        ElMessage.success("取消收藏成功");
      } else {
        const result = await addFavoriteApi(userId, surveyId);
        // 添加收藏成功后，需要重新加载收藏列表以获取完整的数据
        const favoritesResponse = await getFavoritesApi(userId);
        const favorites = Array.isArray(favoritesResponse)
          ? favoritesResponse
          : favoritesResponse.data || [];
        userStore.setUserData({ favorites });
        ElMessage.success("收藏成功");
      }
    } catch (error) {
      console.error("收藏操作失败：", error);
      ElMessage.error("操作失败：" + error.message);
    }
  };

  // 事件处理
  const handleSearch = () => {
    currentPage.value = 1;
  };

  const handleCategoryChange = () => {
    currentPage.value = 1;
  };

  const handleSortChange = () => {
    currentPage.value = 1;
  };

  const handlePageChange = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSizeChange = () => {
    currentPage.value = 1;
  };

  return {
    // 数据
    searchQuery,
    selectedCategory,
    sortBy,
    currentPage,
    pageSize,
    loading,

    // 计算属性
    surveys,
    categories,
    filteredSurveys,
    totalSurveys,
    totalParticipants,
    userFavorites,
    userPoints,

    // 方法
    loadData,
    getCategoryName,
    isFavorite,
    toggleFavorite,

    // 事件处理
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
    handleSizeChange,

    // Store
    userStore,
  };
}
