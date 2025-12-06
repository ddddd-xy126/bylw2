import { ref, computed } from "vue";
import { useUserStore } from "@/store/user";

/**
 * 通用列表筛选分页 hooks
 * @param {Object} options - 配置项
 * @param {Ref} options.sourceList - 源数据列表 ref
 * @param {Array<string>} [options.searchFields=['title']] - 搜索匹配字段
 * @param {Function} [options.sortFn] - 自定义排序函数
 * @param {number} [options.initialPageSize=10] - 初始每页大小
 */
export function useListFilter(options = {}) {
  const {
    sourceList,
    searchFields = ["title"],
    sortFn = null,
    initialPageSize = 10,
  } = options;

  const userStore = useUserStore();

  const searchKeyword = ref("");
  const filterCategory = ref("");
  const dateRange = ref([]);
  const currentPage = ref(1);
  const pageSize = ref(initialPageSize);
  const sortBy = ref("default");

  const handleSearch = () => (currentPage.value = 1);
  const handleFilter = () => (currentPage.value = 1);
  const handleSort = () => (currentPage.value = 1);
  const handlePageChange = (page) => (currentPage.value = page);

  const filteredList = computed(() => {
    let result = [...(sourceList.value || [])];

    // 🔍 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.trim();
      result = result.filter((item) =>
        searchFields.some((field) => item[field]?.includes(keyword))
      );
    }

    // 🏷 分类过滤
    if (filterCategory.value) {
      result = result.filter((item) => item.category === filterCategory.value);
    }

    // 日期过滤（假设 item 有 createdAt/publishedAt/submittedAt）
    if (dateRange.value?.length === 2) {
      const [start, end] = dateRange.value;
      result = result.filter((item) => {
        const date =
          item.publishedAt?.split("T")[0] ||
          item.submittedAt?.split("T")[0] ||
          item.createdAt?.split("T")[0];
        return date >= start && date <= end;
      });
    }

    // 排序（自定义）
      // 排序：优先使用传入的自定义 sortFn；否则根据内部 sortBy 值使用默认规则
      if (sortFn) {
        result.sort(sortFn);
      } else {
        // 内置排序策略：latest（按 createdAt 降序）、hot（按 participants/participantCount 降序）、recommended（基于标签匹配的个性化推荐）
        if (sortBy.value === 'latest') {
          result.sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });
        } else if (sortBy.value === 'hot') {
          result.sort((a, b) => {
            const pa = Number(a.participants || a.participantCount || 0);
            const pb = Number(b.participants || b.participantCount || 0);
            return pb - pa;
          });
        } else if (sortBy.value === 'recommended') {
          // 智能推荐：根据用户标签进行相关性推荐
          const userTags = userStore.profile?.tags || [];
          console.log("[推荐系统] 用户标签:", userTags);
          console.log("[推荐系统] 用户完整资料:", userStore.profile);
          console.log("[推荐系统] 排序前result数组长度:", result.length);

          if (userTags && userTags.length > 0) {
            // 有标签时：计算相关性得分
            result.forEach((survey) => {
              const surveyTags = survey.tags || [];
              console.log(`[推荐系统] 问卷"${survey.title}"的标签:`, surveyTags, "类型:", typeof surveyTags, "是否数组:", Array.isArray(surveyTags));
              
              // 计算标签匹配度
              const matchCount = surveyTags.filter((tag) =>
                userTags.includes(tag)
              ).length;
              const tagScore = matchCount / Math.max(userTags.length, 1);
              
              // 判断是否完全匹配(用户所有标签都在问卷标签中)
              const isFullMatch = userTags.every(tag => surveyTags.includes(tag));
              
              console.log(`[推荐系统] 问卷"${survey.title}" - 匹配标签数:${matchCount}, 标签得分:${tagScore}, 完全匹配:${isFullMatch}`);

              // 综合评分：标签匹配(50%) + 评分(30%) + 参与人数(20%)
              survey.recommendScore =
                tagScore * 0.5 +
                ((survey.rating || 0) / 5) * 0.3 +
                Math.min(
                  (survey.participantCount || survey.participants || 0) / 1000,
                  1
                ) *
                  0.2;
              
              // 存储匹配信息用于排序
              survey.matchCount = matchCount;
              survey.isFullMatch = isFullMatch;
            });

            // 按优先级排序：完全匹配 > 部分匹配(按匹配数量) > 无匹配(按评分)
            result.sort((a, b) => {
              // 优先级1: 完全匹配的排最前
              if (a.isFullMatch && !b.isFullMatch) return -1;
              if (!a.isFullMatch && b.isFullMatch) return 1;
              
              // 优先级2: 匹配标签数量多的在前
              if (a.matchCount !== b.matchCount) {
                return b.matchCount - a.matchCount;
              }
              
              // 优先级3: 匹配数量相同时,按综合得分排序
              return (b.recommendScore || 0) - (a.recommendScore || 0);
            });

            console.log(
              "[推荐系统] 基于标签匹配推荐，前5个问卷:",
              result.slice(0, 5).map((s) => ({
                title: s.title,
                tags: s.tags,
                matchCount: s.matchCount,
                isFullMatch: s.isFullMatch,
                score: s.recommendScore,
              }))
            );
            console.log("[推荐系统] 排序后result数组长度:", result.length);
            console.log("[推荐系统] 当前页码:", currentPage.value, "每页大小:", pageSize.value);
          } else {
            // 无标签时：随机打乱顺序展示
            result = result.sort(() => Math.random() - 0.5);
            console.log("[推荐系统] 用户无标签，随机推荐");
          }
        }
      }

    // 记录过滤前的总数（用于展示"无结果"或分页总数）
    // 注意：totalItems 保持为源数据总数（未必等于过滤后数量）
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const finalResult = result.slice(startIndex, startIndex + pageSize.value);
    console.log("[推荐系统] 分页切片 - 开始索引:", startIndex, "结束索引:", startIndex + pageSize.value, "最终返回数量:", finalResult.length);
    return finalResult;
  });

  // 过滤后（但分页前）的总条目数
  const filteredTotal = computed(() => {
    let result = [...(sourceList.value || [])];

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.trim();
      result = result.filter((item) =>
        searchFields.some((field) => item[field]?.includes(keyword))
      );
    }

    if (filterCategory.value) {
      result = result.filter((item) => item.category === filterCategory.value);
    }

    if (dateRange.value?.length === 2) {
      const [start, end] = dateRange.value;
      result = result.filter((item) => {
        const date =
          item.publishedAt?.split("T")[0] ||
          item.submittedAt?.split("T")[0] ||
          item.createdAt?.split("T")[0];
        return date >= start && date <= end;
      });
    }

    if (sortFn) {
      result.sort(sortFn);
    }

    return result.length;
  });

  const totalItems = computed(() => sourceList.value?.length || 0);

  return {
    // 状态
    searchKeyword,
    filterCategory,
    dateRange,
    sortBy,
    currentPage,
    pageSize,

  // 计算结果
  filteredList,
  filteredTotal,
  totalItems,

    // 方法
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
  };
}
