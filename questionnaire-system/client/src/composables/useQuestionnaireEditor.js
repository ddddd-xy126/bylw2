import {
  ref,
  reactive,
  nextTick,
  onMounted,
  onBeforeUnmount,
  computed,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user";
import { getCategoriesApi, getSurveyDetail } from "@/api/survey";
import apiClient from "@/api/index.js";

export function useQuestionnaireEditor() {
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();

  // 判断是否为管理员
  const isAdmin = computed(() => userStore.profile?.role === "admin");

  // 检查是否为编辑模式
  const isEditMode = ref(false);
  const isTemplateMode = ref(false);
  const currentQuestionnaireId = ref(null);
  const currentTemplateId = ref(null);
  const originalQuestionnaireData = ref(null);

  // 自动保存相关
  const autoSaveTimer = ref(null);
  const lastSavedData = ref(null);

  // 响应式数据
  const formRef = ref(null);
  const tagInputRef = ref(null);
  const tagInputVisible = ref(false);
  const tagInputValue = ref("");

  // 问卷基本信息
  const questionnaireForm = reactive({
    title: "",
    description: "",
    category: "",
    duration: 10,
    tags: [],
  });

  // 问题列表
  const questions = ref([]);
  const activeQuestionId = ref(null);

  // 问卷设置
  const settingsForm = reactive({
    thankMessage: "感谢您的参与！您的回答已经成功提交。",
    showProgress: true,
    randomOrder: false,
  });

  // 分类数据
  const categories = ref([]);

  // 表单验证规则
  const formRules = {
    title: [
      { required: true, message: "请输入问卷标题", trigger: "blur" },
      {
        min: 2,
        max: 100,
        message: "标题长度在 2 到 100 个字符",
        trigger: "blur",
      },
    ],
    description: [
      { required: true, message: "请输入问卷描述", trigger: "blur" },
      {
        min: 2,
        max: 500,
        message: "描述长度在 2 到 500 个字符",
        trigger: "blur",
      },
    ],
    category: [
      { required: true, message: "请选择问卷分类", trigger: "change" },
    ],
    duration: [{ required: true, message: "请设置预估时长", trigger: "blur" }],
    tags: [
      {
        required: true,
        message: "请至少添加一个标签",
        trigger: "change",
        validator: (rule, value, callback) => {
          if (!value || value.length === 0) {
            callback(new Error("请至少添加一个标签"));
          } else {
            callback();
          }
        },
      },
    ],
  };

  // 加载分类数据
  const loadCategories = async () => {
    try {
      const data = await getCategoriesApi();
      categories.value = data.map((cat) => ({
        label: cat.name,
        value: cat.name,
      }));
    } catch (error) {
      console.error("加载分类失败:", error);
      categories.value = [
        { label: "企业管理", value: "企业管理" },
        { label: "产品研发", value: "产品研发" },
        { label: "心理健康", value: "心理健康" },
        { label: "教育培训", value: "教育培训" },
        { label: "市场调研", value: "市场调研" },
        { label: "用户体验", value: "用户体验" },
        { label: "学术研究", value: "学术研究" },
        { label: "活动反馈", value: "活动反馈" },
        { label: "其他", value: "其他" },
      ];
    }
  };

  // 本地存储管理
  const saveToLocalStorage = (data) => {
    try {
      const key = isEditMode.value
        ? `edit_questionnaire_${currentQuestionnaireId.value}`
        : "new_questionnaire_draft";
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("本地保存失败:", error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const key = isEditMode.value
        ? `edit_questionnaire_${currentQuestionnaireId.value}`
        : "new_questionnaire_draft";
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("从本地存储加载失败:", error);
      return null;
    }
  };

  const clearLocalStorage = () => {
    try {
      const key = isEditMode.value
        ? `edit_questionnaire_${currentQuestionnaireId.value}`
        : "new_questionnaire_draft";
      localStorage.removeItem(key);
    } catch (error) {
      console.error("清理本地存储失败:", error);
    }
  };

  // 自动保存功能
  const startAutoSave = () => {
    autoSaveTimer.value = setInterval(() => {
      const currentData = buildQuestionnaireData("draft");
      const dataStr = JSON.stringify(currentData);

      if (dataStr !== lastSavedData.value) {
        saveToLocalStorage(currentData);
        lastSavedData.value = dataStr;
      }
    }, 30000);
  };

  // 检查本地草稿
  const checkLocalDraft = async () => {
    const localData = loadFromLocalStorage();
    if (localData && (localData.title || localData.questions?.length > 0)) {
      try {
        await ElMessageBox.confirm(
          "检测到有未保存的草稿，是否继续编辑？",
          "恢复草稿",
          {
            confirmButtonText: "继续编辑",
            cancelButtonText: "新建问卷",
            type: "info",
          }
        );
        loadQuestionnaireData(localData);
      } catch {
        clearLocalStorage();
      }
    }
  };

  // 加载模板
  const loadTemplate = async (templateId) => {
    try {
      console.log("[加载模板] 模板ID:", templateId);
      const templateData = await getSurveyDetail(templateId);

      if (!templateData) {
        ElMessage.error("模板不存在");
        router.push("/questionnaires/create");
        return;
      }

      questionnaireForm.title = templateData.title || "";
      questionnaireForm.description = templateData.description || "";
      questionnaireForm.category =
        templateData.categoryValue || templateData.category || "";
      questionnaireForm.duration = templateData.duration || 10;
      questionnaireForm.tags = Array.isArray(templateData.tags)
        ? [...templateData.tags]
        : [];

      if (
        templateData.questionList &&
        Array.isArray(templateData.questionList) &&
        templateData.questionList.length > 0
      ) {
        questions.value = templateData.questionList.map((q, index) => ({
          ...q,
          id: Date.now() + index,
        }));
      } else if (
        templateData.questions &&
        Array.isArray(templateData.questions) &&
        templateData.questions.length > 0
      ) {
        questions.value = templateData.questions.map((q, index) => ({
          ...q,
          id: Date.now() + index,
        }));
      } else {
        ElMessage.warning("该模板暂无问题，您可以自行添加问题");
      }

      if (templateData.settings) {
        Object.assign(settingsForm, templateData.settings);
      }

      ElMessage.success("模板加载成功");
    } catch (error) {
      console.error("加载模板失败:", error);
      ElMessage.error("加载模板失败：" + (error.message || "未知错误"));
      router.push("/questionnaires/create");
    }
  };

  // 编辑模式：加载现有问卷数据
  const loadQuestionnaireForEdit = async (id) => {
    try {
      console.log("[编辑模式] 开始加载问卷，ID:", id);

      const localData = loadFromLocalStorage();
      if (localData) {
        const shouldLoadLocal = await ElMessageBox.confirm(
          "检测到有未保存的编辑内容，是否继续编辑？",
          "恢复编辑",
          {
            confirmButtonText: "继续编辑",
            cancelButtonText: "重新开始",
            type: "info",
          }
        ).catch(() => false);

        if (shouldLoadLocal) {
          loadQuestionnaireData(localData);
          return;
        } else {
          clearLocalStorage();
        }
      }

      const questionnaireData = await getSurveyDetail(id);
      originalQuestionnaireData.value = questionnaireData;
      loadQuestionnaireData(questionnaireData);
    } catch (error) {
      console.error("[编辑模式] 加载问卷失败:", error);
      ElMessage.error("加载问卷失败：" + error.message);
      router.push("/create");
    }
  };

  // 将问卷数据加载到表单
  const loadQuestionnaireData = (data) => {
    questionnaireForm.title = data.title || "";
    questionnaireForm.description = data.description || "";
    questionnaireForm.category = data.category || "";
    questionnaireForm.duration = data.duration || 10;
    questionnaireForm.tags = data.tags || [];

    const questionData = data.questionList || data.questions || [];
    questions.value = Array.isArray(questionData) ? questionData : [];

    if (data.settings) {
      Object.assign(settingsForm, data.settings);
    }
  };

  // 页面离开前检查
  const handleBeforeUnload = (event) => {
    if (hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = "您有未保存的更改，确定要离开吗？";
    }
  };

  const hasUnsavedChanges = () => {
    return (
      questionnaireForm.title ||
      questionnaireForm.description ||
      questions.value.length > 0
    );
  };

  // 问题操作方法
  const handleAddQuestion = (type) => {
    if (!type) {
      ElMessage.warning("请选择问题类型");
      return;
    }

    const questionTypes = {
      single: {
        type: "single",
        title: "新的单选题",
        description: "",
        required: false,
        options: [
          { id: "opt1", text: "选项1" },
          { id: "opt2", text: "选项2" },
        ],
        allowOther: false,
      },
      multiple: {
        type: "multiple",
        title: "新的多选题",
        description: "",
        required: false,
        options: [
          { id: "opt1", text: "选项1" },
          { id: "opt2", text: "选项2" },
          { id: "opt3", text: "选项3" },
        ],
        allowOther: false,
        randomOrder: false,
      },
      text: {
        type: "text",
        title: "新的文本题",
        description: "",
        required: false,
        textType: "text",
        placeholder: "请输入...",
        minLength: null,
        maxLength: 500,
      },
      rating: {
        type: "rating",
        title: "新的评分题",
        description: "",
        required: false,
        minRating: 1,
        maxRating: 5,
        ratingStyle: "star",
        ratingLabels: { low: "很差", high: "很好" },
      },
    };

    const questionTemplate = questionTypes[type];
    if (!questionTemplate) {
      ElMessage.error("未知的问题类型");
      return;
    }

    const newQuestion = {
      ...questionTemplate,
      id: Date.now() + Math.random(),
    };

    questions.value.push(newQuestion);
    activeQuestionId.value = newQuestion.id;
    ElMessage.success(`已添加${getQuestionTypeText(type)}`);
  };

  const updateQuestionTitle = (questionId, newTitle) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question) {
      question.title = newTitle;
    }
  };

  const updateQuestionDescription = (questionId, newDescription) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question) {
      question.description = newDescription;
    }
  };

  const toggleQuestionRequired = (questionId) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question) {
      question.required = !question.required;
    }
  };

  const addOption = (questionId) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (
      question &&
      (question.type === "single" || question.type === "multiple")
    ) {
      const optionIndex = question.options.length + 1;
      const newOption = {
        id: `opt${optionIndex}_${Date.now()}`,
        text: `选项${optionIndex}`,
      };
      question.options.push(newOption);
      ElMessage.success("已添加选项");
    }
  };

  const removeOption = (questionId, optionIndex) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      question.options.splice(optionIndex, 1);
    } else {
      ElMessage.warning("至少需要保留2个选项");
    }
  };

  const updateOptionText = (questionId, optionIndex, newText) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question && question.options && question.options[optionIndex]) {
      question.options[optionIndex].text = newText;
    }
  };

  const toggleQuestionLogic = (questionId) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question) {
      question.enableLogic = !question.enableLogic;
      if (question.enableLogic && !question.logicRules) {
        question.logicRules = [];
      }
    }
  };

  const addLogicRule = (questionId) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question) {
      if (!question.logicRules) {
        question.logicRules = [];
      }
      const currentIndex = questions.value.findIndex(
        (q) => q.id === questionId
      );

      // 添加"结束问卷"选项和后续题目选项
      question.logicRules.push({
        optionId: question.options[0]?.id || "",
        targetQuestion: currentIndex + 2, // 默认跳转到下一题
        isEnd: false, // 标记是否结束问卷
      });
      ElMessage.success("已添加跳转规则");
    }
  };

  const removeLogicRule = (questionId, ruleIndex) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question && question.logicRules) {
      question.logicRules.splice(ruleIndex, 1);
      ElMessage.success("已删除跳转规则");
    }
  };

  const updateLogicRuleOption = (questionId, ruleIndex, optionId) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question && question.logicRules && question.logicRules[ruleIndex]) {
      question.logicRules[ruleIndex].optionId = optionId;
    }
  };

  const updateLogicRuleTarget = (questionId, ruleIndex, target) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (question && question.logicRules && question.logicRules[ruleIndex]) {
      // 如果选择"结束问卷"（值为 'end'）
      if (target === "end") {
        question.logicRules[ruleIndex].isEnd = true;
        question.logicRules[ruleIndex].targetQuestion = null;
      } else {
        question.logicRules[ruleIndex].isEnd = false;
        question.logicRules[ruleIndex].targetQuestion = target;
      }
    }
  };

  const copyQuestion = (question) => {
    const copiedQuestion = JSON.parse(JSON.stringify(question));
    copiedQuestion.id = Date.now() + Math.random();
    copiedQuestion.title = question.title + " (副本)";

    if (copiedQuestion.options && Array.isArray(copiedQuestion.options)) {
      copiedQuestion.options = copiedQuestion.options.map((opt, index) => ({
        ...opt,
        id: `opt${index + 1}_${Date.now()}_${Math.random()}`,
      }));
    }

    questions.value.push(copiedQuestion);
    activeQuestionId.value = copiedQuestion.id;
    ElMessage.success("问题复制成功");
  };

  const deleteQuestion = (questionId) => {
    ElMessageBox.confirm("确定要删除这个问题吗？", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        const index = questions.value.findIndex((q) => q.id === questionId);
        if (index !== -1) {
          questions.value.splice(index, 1);
          ElMessage.success("问题删除成功");
        }
      })
      .catch(() => {});
  };

  const getQuestionTypeText = (type) => {
    const typeMap = {
      single: "单选题",
      multiple: "多选题",
      text: "文本题",
      rating: "评分题",
      likert: "量表题",
    };
    return typeMap[type] || "未知题型";
  };

  // 标签管理
  const showTagInput = () => {
    tagInputVisible.value = true;
    nextTick(() => {
      tagInputRef.value?.focus();
    });
  };

  const handleTagInputConfirm = () => {
    if (
      tagInputValue.value &&
      !questionnaireForm.tags.includes(tagInputValue.value)
    ) {
      questionnaireForm.tags.push(tagInputValue.value);
      formRef.value?.validateField("tags");
    }
    tagInputVisible.value = false;
    tagInputValue.value = "";
  };

  const removeTag = (tag) => {
    const index = questionnaireForm.tags.indexOf(tag);
    if (index !== -1) {
      questionnaireForm.tags.splice(index, 1);
      formRef.value?.validateField("tags");
    }
  };

  // 问卷操作
  const goBack = () => {
    if (hasUnsavedChanges()) {
      ElMessageBox.confirm("您有未保存的更改，确定要离开吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          router.go(-1);
        })
        .catch(() => {});
    } else {
      router.go(-1);
    }
  };

  const saveAsDraft = async () => {
    if (!validateBasicInfo()) return;

    try {
      const questionnaireData = buildQuestionnaireData("draft");
      const { createQuestionnaire, updateQuestionnaire } = await import(
        "@/api/questionnaire"
      );

      if (isEditMode.value && currentQuestionnaireId.value) {
        await updateQuestionnaire(
          currentQuestionnaireId.value,
          questionnaireData
        );
        ElMessage.success("草稿更新成功");
      } else {
        const result = await createQuestionnaire(questionnaireData);

        if (result.pointsEarned) {
          if (userStore.profile) {
            userStore.profile.points =
              (userStore.profile.points || 0) + result.pointsEarned;
          }
          ElMessage.success(`草稿保存成功！获得 ${result.pointsEarned} 积分`);
        } else {
          ElMessage.success("草稿保存成功");
        }
      }

      clearLocalStorage();
      router.push("/profile/questionnaires/created");
    } catch (error) {
      console.error("保存草稿失败:", error);
      ElMessage.error("保存失败：" + error.message);
    }
  };

  const publishQuestionnaire = async () => {
    if (!validateForm()) return;

    try {
      const statusToSet = isAdmin.value ? "published" : "pending";
      const confirmMessage = isAdmin.value
        ? isEditMode.value
          ? "确定要更新此问卷吗？更新后将立即生效。"
          : "确定要发布此问卷吗？发布后将立即上线。"
        : isEditMode.value
        ? "确定要提交此问卷进行审核吗？提交后需等待管理员审核。"
        : "确定要提交此问卷进行审核吗？";

      await ElMessageBox.confirm(
        confirmMessage,
        isAdmin.value
          ? "确认" + (isEditMode.value ? "更新" : "发布")
          : "确认提交",
        {
          confirmButtonText: isAdmin.value
            ? "确定" + (isEditMode.value ? "更新" : "发布")
            : "确定提交",
          cancelButtonText: "取消",
          type: "warning",
        }
      );

      const questionnaireData = buildQuestionnaireData(statusToSet);

      if (isEditMode.value && currentQuestionnaireId.value) {
        if (isAdmin.value) {
          await apiClient.put(
            `/surveys/${currentQuestionnaireId.value}`,
            questionnaireData
          );
          ElMessage.success("问卷更新成功！");

          const { recordAdminActivity } = await import("@/api/admin");
          await recordAdminActivity({
            adminId: userStore.profile.id,
            adminName: userStore.profile.nickname || userStore.profile.username,
            title: "编辑问卷",
            description: `编辑了问卷"${questionnaireData.title}"`,
            type: "questionnaire_edit",
          });
        } else {
          const { updateQuestionnaire } = await import("@/api/questionnaire");
          await updateQuestionnaire(
            currentQuestionnaireId.value,
            questionnaireData
          );
          ElMessage.success("问卷已重新提交审核！");
        }
      } else {
        if (isAdmin.value) {
          await apiClient.post("/surveys", questionnaireData);
          ElMessage.success("问卷发布成功！");

          const { recordAdminActivity } = await import("@/api/admin");
          await recordAdminActivity({
            adminId: userStore.profile.id,
            adminName: userStore.profile.nickname || userStore.profile.username,
            title: "创建问卷",
            description: `创建了新问卷"${questionnaireData.title}"`,
            type: "questionnaire_create",
          });
        } else {
          const { createQuestionnaire } = await import("@/api/questionnaire");
          const result = await createQuestionnaire(questionnaireData);

          if (result.pointsEarned) {
            if (userStore.profile) {
              userStore.profile.points =
                (userStore.profile.points || 0) + result.pointsEarned;
            }
            ElMessage.success(
              `问卷已提交审核！获得 ${result.pointsEarned} 积分`
            );
          } else {
            ElMessage.success("问卷已提交审核！");
          }
        }
      }

      clearLocalStorage();

      if (isAdmin.value) {
        router.push("/admin/questionnaires/list");
      } else {
        router.push("/profile/questionnaires/created");
      }
    } catch (error) {
      if (error !== "cancel") {
        console.error("发布失败:", error);
        ElMessage.error("发布失败：" + error.message);
      }
    }
  };

  const buildQuestionnaireData = (status = "draft") => {
    const userId = userStore.profile?.id || 1;
    const userName =
      userStore.profile?.nickname || userStore.profile?.username || "匿名用户";

    const formattedQuestions = questions.value.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    const baseData = {
      title: questionnaireForm.title,
      description: questionnaireForm.description,
      category: questionnaireForm.category,
      duration: questionnaireForm.duration,
      tags: questionnaireForm.tags,
      questions: formattedQuestions.length,
      questionList: formattedQuestions,
      settings: {
        ...settingsForm,
      },
      status: status,
      updatedAt: new Date().toISOString(),
    };

    if (isEditMode.value && originalQuestionnaireData.value) {
      return {
        ...originalQuestionnaireData.value,
        ...baseData,
        id: currentQuestionnaireId.value || originalQuestionnaireData.value.id,
        userId:
          originalQuestionnaireData.value.userId ||
          originalQuestionnaireData.value.authorId ||
          userId,
        authorId:
          originalQuestionnaireData.value.authorId ||
          originalQuestionnaireData.value.userId ||
          userId,
        authorName:
          originalQuestionnaireData.value.authorName ||
          originalQuestionnaireData.value.author ||
          userName,
        author:
          originalQuestionnaireData.value.author ||
          originalQuestionnaireData.value.authorName ||
          userName,
        createdAt: originalQuestionnaireData.value.createdAt,
        participants:
          originalQuestionnaireData.value.participants ||
          originalQuestionnaireData.value.participantCount ||
          0,
        participantCount:
          originalQuestionnaireData.value.participantCount ||
          originalQuestionnaireData.value.participants ||
          0,
      };
    }

    return {
      ...baseData,
      id: currentQuestionnaireId.value || Date.now(),
      createdAt: new Date().toISOString(),
      userId: userId,
      authorId: userId,
      authorName: userName,
      author: userName,
      participants: 0,
      participantCount: 0,
    };
  };

  const validateBasicInfo = () => {
    if (!questionnaireForm.title.trim()) {
      ElMessage.error("请输入问卷标题");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!validateBasicInfo()) return false;

    if (!questionnaireForm.description.trim()) {
      ElMessage.error("请输入问卷描述");
      return false;
    }

    if (!questionnaireForm.category) {
      ElMessage.error("请选择问卷分类");
      return false;
    }

    if (questions.value.length === 0) {
      ElMessage.error("请至少添加一个问题");
      return false;
    }

    for (let i = 0; i < questions.value.length; i++) {
      const question = questions.value[i];

      if (!question.title || !question.title.trim()) {
        ElMessage.error(`第${i + 1}个问题的标题不能为空`);
        return false;
      }

      if (
        (question.type === "single" || question.type === "multiple") &&
        (!question.options || question.options.length < 2)
      ) {
        ElMessage.error(`第${i + 1}个问题至少需要2个选项`);
        return false;
      }

      if (question.type === "single" || question.type === "multiple") {
        const validOptions = question.options.filter(
          (opt) => opt && opt.text && opt.text.trim()
        );
        if (validOptions.length < 2) {
          ElMessage.error(`第${i + 1}个问题至少需要2个有效选项`);
          return false;
        }
      }
    }

    return true;
  };

  // 初始化
  const initialize = () => {
    loadCategories();

    if (route.path.includes("/edit/")) {
      isEditMode.value = true;
      currentQuestionnaireId.value = route.params.id;
      loadQuestionnaireForEdit(route.params.id);
    } else if (route.path.includes("/template/")) {
      isTemplateMode.value = true;
      currentTemplateId.value = route.params.id;
      loadTemplate(route.params.id);
    } else {
      checkLocalDraft();
    }

    startAutoSave();
    window.addEventListener("beforeunload", handleBeforeUnload);
  };

  const cleanup = () => {
    if (autoSaveTimer.value) {
      clearInterval(autoSaveTimer.value);
    }
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };

  return {
    // 状态
    isAdmin,
    isEditMode,
    isTemplateMode,
    formRef,
    tagInputRef,
    tagInputVisible,
    tagInputValue,
    questionnaireForm,
    questions,
    activeQuestionId,
    settingsForm,
    categories,
    formRules,

    // 方法
    initialize,
    cleanup,
    goBack,
    handleAddQuestion,
    updateQuestionTitle,
    updateQuestionDescription,
    toggleQuestionRequired,
    addOption,
    removeOption,
    updateOptionText,
    toggleQuestionLogic,
    addLogicRule,
    removeLogicRule,
    updateLogicRuleOption,
    updateLogicRuleTarget,
    copyQuestion,
    deleteQuestion,
    getQuestionTypeText,
    showTagInput,
    handleTagInputConfirm,
    removeTag,
    saveAsDraft,
    publishQuestionnaire,
  };
}
