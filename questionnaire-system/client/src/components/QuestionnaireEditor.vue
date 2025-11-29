<template>
  <div class="custom-create" :class="{ 'admin-mode': isAdmin }">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <el-button
          v-if="!isAdmin"
          @click="goBack"
          type="text"
          size="large"
          class="back-button"
        >
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        <h1>
          {{
            isEditMode
              ? "编辑问卷"
              : isTemplateMode
              ? "基于模板创建"
              : "自定义创建问卷"
          }}
        </h1>
        <p v-if="isAdmin && !isEditMode">
          管理员创建的问卷将直接发布，无需审核
        </p>
        <p v-else>
          {{
            isEditMode
              ? "修改问卷内容和设置"
              : isTemplateMode
              ? "基于专业模板快速创建问卷"
              : "从零开始设计您的问卷，完全自定义问题类型、逻辑和样式"
          }}
        </p>
      </div>
    </div>

    <!-- 问卷基本信息 -->
    <div class="basic-info-section">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>问卷基本信息</span>
            <el-tag type="info" size="small">必填</el-tag>
          </div>
        </template>

        <el-form
          :model="questionnaireForm"
          :rules="formRules"
          ref="formRef"
          label-width="120px"
        >
          <el-form-item label="问卷标题" prop="title">
            <el-input
              v-model="questionnaireForm.title"
              placeholder="请输入问卷标题"
              size="large"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="问卷描述" prop="description">
            <el-input
              v-model="questionnaireForm.description"
              type="textarea"
              placeholder="请描述问卷的目的、内容简介等"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="问卷分类" prop="category">
                <el-select
                  v-model="questionnaireForm.category"
                  placeholder="请选择分类"
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="category in categories"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预估时长" prop="duration">
                <el-input-number
                  v-model="questionnaireForm.duration"
                  :min="1"
                  :max="120"
                  size="large"
                  style="width: 100%"
                />
                <span class="input-suffix">分钟</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="问卷标签" prop="tags">
            <div class="tags-input">
              <el-tag
                v-for="tag in questionnaireForm.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                size="small"
                @keyup.enter="handleTagInputConfirm"
                @blur="handleTagInputConfirm"
                class="tag-input"
              />
              <el-button
                v-else
                size="small"
                @click="showTagInput"
                class="add-tag-btn"
              >
                + 添加标签
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 问题设计区域 -->
    <div class="questions-section">
      <el-card class="questions-card">
        <template #header>
          <div class="card-header">
            <span>问题设计 ({{ questions.length }})</span>
            <div class="header-actions">
              <el-dropdown @command="handleAddQuestion" trigger="click">
                <el-button type="primary" size="small">
                  <el-icon><Plus /></el-icon>
                  添加问题
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="single">
                      <el-icon><Select /></el-icon>
                      单选题
                    </el-dropdown-item>
                    <el-dropdown-item command="multiple">
                      <el-icon><Finished /></el-icon>
                      多选题
                    </el-dropdown-item>
                    <el-dropdown-item command="text">
                      <el-icon><Edit /></el-icon>
                      文本题
                    </el-dropdown-item>
                    <el-dropdown-item command="rating">
                      <el-icon><Star /></el-icon>
                      评分题
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <div v-if="questions.length === 0" class="empty-questions">
          <el-empty description="暂无问题，点击上方按钮添加问题">
            <el-button
              type="primary"
              size="large"
              @click="handleAddQuestion('single')"
            >
              <el-icon><Plus /></el-icon>
              添加第一个问题
            </el-button>
          </el-empty>
        </div>

        <div v-else class="questions-list">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="question-item"
            :class="{ active: activeQuestionId === question.id }"
          >
            <div class="question-header">
              <div class="question-info">
                <span class="drag-handle">
                  <el-icon><Sort /></el-icon>
                </span>
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-type-badge">{{
                  getQuestionTypeText(question.type)
                }}</span>
              </div>
              <div class="question-actions">
                <el-checkbox
                  :model-value="question.required"
                  @change="toggleQuestionRequired(question.id)"
                  size="small"
                >
                  必填
                </el-checkbox>
                <el-button
                  size="small"
                  type="text"
                  @click="copyQuestion(question)"
                >
                  复制
                </el-button>
                <el-button
                  size="small"
                  type="text"
                  @click="deleteQuestion(question.id)"
                  class="danger-btn"
                >
                  删除
                </el-button>
              </div>
            </div>

            <div class="question-content">
              <div class="question-title-editor">
                <el-input
                  :model-value="question.title"
                  @input="updateQuestionTitle(question.id, $event)"
                  placeholder="请输入问题标题"
                  size="large"
                  maxlength="200"
                  show-word-limit
                />
                <span v-if="question.required" class="required-mark">*</span>
              </div>

              <div class="question-description-editor" style="margin-top: 8px">
                <el-input
                  :model-value="question.description"
                  @input="updateQuestionDescription(question.id, $event)"
                  placeholder="问题描述（可选）"
                  type="textarea"
                  :rows="2"
                  maxlength="500"
                  show-word-limit
                />
              </div>

              <!-- 选择题选项编辑 -->
              <div
                v-if="
                  question.type === 'single' || question.type === 'multiple'
                "
                class="options-editor"
                style="margin-top: 12px"
              >
                <div class="options-header">
                  <span>选项设置</span>
                  <el-button size="small" @click="addOption(question.id)">
                    <el-icon><Plus /></el-icon>
                    添加选项
                  </el-button>
                </div>
                <div class="options-list">
                  <div
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    class="option-editor-item"
                  >
                    <span class="option-label"
                      >{{ String.fromCharCode(65 + optIndex) }}.</span
                    >
                    <el-input
                      :model-value="option.text"
                      @input="updateOptionText(question.id, optIndex, $event)"
                      :placeholder="`选项${optIndex + 1}`"
                      size="small"
                    />
                    <el-button
                      size="small"
                      type="text"
                      @click="removeOption(question.id, optIndex)"
                      :disabled="question.options.length <= 2"
                      class="danger-btn"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 跳转逻辑配置 -->
                <div class="logic-config" style="margin-top: 12px">
                  <div class="logic-header">
                    <el-checkbox
                      :model-value="question.enableLogic"
                      @change="toggleQuestionLogic(question.id)"
                      size="small"
                    >
                      启用跳转逻辑
                    </el-checkbox>
                    <el-tooltip placement="top">
                      <template #content>
                        <div style="max-width: 300px">
                          <p>根据用户选择的选项跳转到不同题目或结束问卷。</p>
                          <p style="color: #f56c6c; margin-top: 8px">
                            ⚠️ 注意：<br />
                            1. 只有单选题和多选题可以设置跳转逻辑<br />
                            2. 可以选择跳转到后续题目或直接结束问卷<br />
                            3. 如果用户答案不匹配任何规则，将继续下一题
                          </p>
                        </div>
                      </template>
                      <el-icon
                        style="margin-left: 4px; color: #909399; cursor: help"
                      >
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>

                  <el-alert
                    v-if="question.enableLogic"
                    title="跳转逻辑配置说明"
                    type="warning"
                    :closable="false"
                    style="margin-top: 8px; font-size: 12px"
                  >
                    <div>
                      <p>当前题目启用了跳转逻辑，请注意：</p>
                      <ul style="margin: 8px 0 8px 20px; padding: 0">
                        <li>
                          如果用户的答案匹配某个跳转规则，将按照规则跳转或结束
                        </li>
                        <li>
                          如果用户的答案不匹配任何跳转规则，将<strong
                            style="color: #f56c6c"
                            >继续到下一题</strong
                          >
                        </li>
                        <li>可以选择"结束问卷"来在某个选项后直接完成问卷</li>
                      </ul>
                    </div>
                  </el-alert>

                  <div
                    v-if="question.enableLogic"
                    class="logic-rules"
                    style="
                      margin-top: 8px;
                      padding: 12px;
                      background: #f5f7fa;
                      border-radius: 4px;
                    "
                  >
                    <div
                      v-for="(rule, ruleIndex) in question.logicRules || []"
                      :key="ruleIndex"
                      class="logic-rule-item"
                      style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 8px;
                      "
                    >
                      <span style="font-size: 12px; color: #606266"
                        >当选择</span
                      >
                      <el-select
                        :model-value="rule.optionId"
                        @change="
                          updateLogicRuleOption(question.id, ruleIndex, $event)
                        "
                        size="small"
                        style="width: 150px"
                        placeholder="选择选项"
                      >
                        <el-option
                          v-for="(opt, optIdx) in question.options"
                          :key="optIdx"
                          :label="`${String.fromCharCode(65 + optIdx)}. ${
                            opt.text
                          }`"
                          :value="opt.id"
                        />
                      </el-select>
                      <span style="font-size: 12px; color: #606266">时，</span>
                      <el-select
                        :model-value="rule.isEnd ? 'end' : rule.targetQuestion"
                        @change="
                          updateLogicRuleTarget(question.id, ruleIndex, $event)
                        "
                        size="small"
                        style="width: 200px"
                        placeholder="选择动作"
                      >
                        <el-option label="结束问卷" value="end" />
                        <el-option
                          v-for="(q, qIdx) in questions"
                          :key="qIdx"
                          :value="qIdx + 1"
                          :label="`跳转到第${qIdx + 1}题: ${
                            q.title || '未命名'
                          }`"
                          :disabled="qIdx <= index"
                        />
                      </el-select>
                      <el-button
                        size="small"
                        type="text"
                        @click="removeLogicRule(question.id, ruleIndex)"
                        class="danger-btn"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-button
                      size="small"
                      @click="addLogicRule(question.id)"
                      style="width: 100%"
                    >
                      <el-icon><Plus /></el-icon>
                      添加跳转规则
                    </el-button>
                  </div>
                </div>

                <!-- 答题模式配置 -->
                <div
                  v-if="
                    question.type === 'single' || question.type === 'multiple'
                  "
                  class="quiz-mode-config"
                  style="margin-top: 12px"
                >
                  <div class="quiz-mode-header">
                    <el-checkbox
                      :model-value="question.quizMode"
                      @change="toggleQuizMode(question.id)"
                      size="small"
                    >
                      启用答题模式
                    </el-checkbox>
                    <el-tooltip placement="top">
                      <template #content>
                        <div style="max-width: 300px">
                          <p>
                            答题模式下，用户选择答案后会实时判断对错并给出反馈。
                          </p>
                          <p style="color: #f56c6c; margin-top: 8px">
                            ⚠️ 注意：<br />
                            1. 启用答题模式必须设置正确答案<br />
                            2. 答题后会自动显示对错动画<br />
                            3. 答题模式问卷不支持生成AI分析报告
                          </p>
                        </div>
                      </template>
                      <el-icon
                        style="margin-left: 4px; color: #909399; cursor: help"
                      >
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>

                  <!-- 设置正确答案 -->
                  <div
                    v-if="question.quizMode"
                    class="correct-answer-section"
                    style="
                      margin-top: 12px;
                      padding: 12px;
                      background: #f0f9ff;
                      border: 1px solid #bfdbfe;
                      border-radius: 4px;
                    "
                  >
                    <div
                      style="
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: #1e40af;
                      "
                    >
                      <el-icon style="margin-right: 4px"><Select /></el-icon>
                      设置正确答案
                    </div>

                    <!-- 单选题正确答案 -->
                    <el-radio-group
                      v-if="question.type === 'single'"
                      :model-value="question.correctAnswer"
                      @change="updateCorrectAnswer(question.id, $event)"
                      style="display: flex; flex-direction: column; gap: 8px"
                    >
                      <el-radio
                        v-for="(opt, optIdx) in question.options"
                        :key="opt.id"
                        :label="opt.id"
                        style="margin: 0"
                      >
                        {{ String.fromCharCode(65 + optIdx) }}. {{ opt.text }}
                      </el-radio>
                    </el-radio-group>

                    <!-- 多选题正确答案 -->
                    <el-checkbox-group
                      v-else-if="question.type === 'multiple'"
                      :model-value="question.correctAnswer || []"
                      @change="updateCorrectAnswer(question.id, $event)"
                      style="display: flex; flex-direction: column; gap: 8px"
                    >
                      <el-checkbox
                        v-for="(opt, optIdx) in question.options"
                        :key="opt.id"
                        :label="opt.id"
                        style="margin: 0"
                      >
                        {{ String.fromCharCode(65 + optIdx) }}. {{ opt.text }}
                      </el-checkbox>
                    </el-checkbox-group>

                    <el-alert
                      v-if="
                        !question.correctAnswer ||
                        (Array.isArray(question.correctAnswer) &&
                          question.correctAnswer.length === 0)
                      "
                      title="请设置正确答案"
                      type="warning"
                      :closable="false"
                      style="margin-top: 12px; font-size: 12px"
                    />
                  </div>
                </div>
              </div>

              <!-- 文本题设置 -->
              <div
                v-else-if="question.type === 'text'"
                class="text-settings"
                style="margin-top: 12px"
              >
                <el-input
                  :model-value="question.placeholder"
                  @input="(val) => (question.placeholder = val)"
                  placeholder="设置占位符文本"
                  size="small"
                  style="margin-bottom: 8px"
                />
                <div class="text-demo">
                  <el-input
                    :type="question.textType || 'text'"
                    :placeholder="question.placeholder || '请输入...'"
                    readonly
                    size="small"
                  />
                </div>
              </div>

              <!-- 评分题预览 -->
              <div
                v-else-if="question.type === 'rating'"
                class="rating-preview"
                style="margin-top: 12px"
              >
                <div class="rating-demo">
                  <el-rate
                    :model-value="0"
                    :max="question.maxRating || 5"
                    disabled
                    show-score
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 问卷设置 -->
    <div class="settings-section">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>问卷设置</span>
          </div>
        </template>

        <el-form :model="settingsForm" label-width="140px">
          <el-form-item label="提交后显示">
            <el-input
              v-model="settingsForm.thankMessage"
              type="textarea"
              :rows="2"
              placeholder="感谢您的参与！您的回答已经成功提交。"
            />
          </el-form-item>

          <el-form-item label="显示进度条">
            <el-switch v-model="settingsForm.showProgress" />
          </el-form-item>

          <el-form-item label="问题随机排序">
            <el-switch v-model="settingsForm.randomOrder" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions">
      <el-button @click="saveAsDraft">
        <el-icon><DocumentCopy /></el-icon>
        保存草稿
      </el-button>
      <el-button type="primary" @click="publishQuestionnaire">
        <el-icon><Promotion /></el-icon>
        {{
          isAdmin
            ? isEditMode
              ? "更新问卷"
              : "发布问卷"
            : isEditMode
            ? "提交审核"
            : "发布问卷"
        }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import {
  ArrowLeft,
  Plus,
  ArrowDown,
  Select,
  Finished,
  Edit,
  Star,
  Sort,
  DocumentCopy,
  Promotion,
  Delete,
  QuestionFilled,
} from "@element-plus/icons-vue";
import { useQuestionnaireEditor } from "@/composables/useQuestionnaireEditor";

const {
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
  toggleQuizMode,
  updateCorrectAnswer,
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
} = useQuestionnaireEditor();

onMounted(() => {
  initialize();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped lang="scss">
.custom-create {
  min-height: 100vh;
  background: var(--theme-background-color);
  padding: 30px 285px;
  margin: 0 auto;

  &.admin-mode {
    background: transparent;
    padding: 30px 155px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.header-section {
  margin-bottom: 32px;

  .header-content {
    position: relative;

    .back-button {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      text-align: center;
      margin-bottom: 12px;
    }

    p {
      font-size: 1.125rem;
      color: #666;
      text-align: center;
      margin: 0;
    }
  }
}

.basic-info-section,
.questions-section,
.settings-section {
  margin-bottom: 32px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .input-suffix {
    margin-left: 8px;
    color: #666;
    font-size: 0.875rem;
  }

  .tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .tag-item {
      margin: 2px;
    }

    .tag-input {
      width: 120px;
    }

    .add-tag-btn {
      border-style: dashed;
    }
  }
}

.empty-questions {
  padding: 60px 0;
  text-align: center;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .question-item {
    border: 2px solid #f0f0f0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover,
    &.active {
      border-color: var(--color-primary-light-3);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .question-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .drag-handle {
          cursor: move;
          color: #999;
        }

        .question-number {
          font-weight: 600;
          color: var(--color-primary-light-3);
        }

        .question-type-badge {
          background: #f0f9ff;
          color: #0369a1;
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
        }
      }

      .question-actions {
        display: flex;
        gap: 8px;

        @media (max-width: 768px) {
          width: 100%;
          justify-content: space-around;
        }

        .danger-btn {
          color: #f56c6c;
        }
      }
    }

    .question-content {
      cursor: pointer;

      .question-title {
        font-size: 1.125rem;
        font-weight: 500;
        color: #333;
        margin-bottom: 12px;

        .required-mark {
          color: #f56c6c;
          margin-left: 4px;
        }
      }
    }
  }
}

.footer-actions {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px 0;
  margin: 32px -24px -24px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.question-title-editor {
  position: relative;

  .required-mark {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #f56c6c;
    font-weight: bold;
  }
}

.options-editor {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 12px;
  background: #fafbfc;

  .options-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 600;
    color: #333;
  }

  .option-editor-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .option-label {
      min-width: 24px;
      font-weight: 600;
      color: #666;
    }
  }
}

.text-settings,
.rating-preview {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 12px;
  background: #fafbfc;

  .text-demo,
  .rating-demo {
    margin-top: 8px;
  }
}
</style>
