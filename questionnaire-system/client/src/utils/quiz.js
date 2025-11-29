/**
 * 答题模式工具函数
 */

/**
 * 检查答案是否正确
 * @param {Object} question - 题目对象
 * @param {*} answer - 用户答案
 * @returns {boolean|null} 是否正确，null表示非答题模式
 */
export function checkQuizAnswer(question, answer) {
  if (!question.quizMode || !question.correctAnswer) {
    return null; // 非答题模式
  }

  const correct = question.correctAnswer;

  if (question.type === "single") {
    // 单选：直接比较
    return answer === correct;
  }

  if (question.type === "multiple") {
    // 多选：数组比较
    if (!Array.isArray(answer) || !Array.isArray(correct)) {
      return false;
    }
    // 排序后比较JSON字符串
    return (
      JSON.stringify([...answer].sort()) === JSON.stringify([...correct].sort())
    );
  }

  return null;
}

/**
 * 检查问卷是否为答题模式
 * @param {Object} survey - 问卷对象
 * @returns {boolean} 是否为答题模式
 */
export function isQuizModeSurvey(survey) {
  // 方式1：检查问卷级别标记
  if (survey.isQuizMode === true) {
    return true;
  }

  // 方式2：遍历题目检查（兼容旧数据）
  const questionList = survey.questionList || [];
  return questionList.some((q) => q.quizMode === true);
}
