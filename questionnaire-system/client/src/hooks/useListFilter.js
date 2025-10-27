import { ref, computed } from "vue";

/**
 * 通用列表筛选分页 hooks
 * @param {Object} options - 配置项
 * @param {Ref} options.sourceList - 源数据列表 ref
 * @param {Array<string>} [options.searchFields=['title']] - 搜索匹配字段
 * @param {Function} [options.sortFn] - 自定义排序函数
 */
export function useListFilter(options = {}) {
  const {
    sourceList,
    searchFields = ["title"],
    sortFn = null,
  } = options;

  const searchKeyword = ref("");
  const filterCategory = ref("");
  const dateRange = ref([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
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
        // 内置排序策略：latest（按 createdAt 降序）、hot（按 participants/participantCount 降序）、recommended（按 rating 降序）
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
          result.sort((a, b) => {
            const ra = Number(a.rating || 0);
            const rb = Number(b.rating || 0);
            return rb - ra;
          });
        }
      }

    // 记录过滤前的总数（用于展示“无结果”或分页总数）
    // 注意：totalItems 保持为源数据总数（未必等于过滤后数量）
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return result.slice(startIndex, startIndex + pageSize.value);
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
