<template>
  <el-dialog 
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="`${survey?.title} - 问卷评论管理`" 
    width="700px"
    class="comments-dialog" 
    :append-to-body="true" 
    :destroy-on-close="true" 
    :z-index="3000"
  >
    <div class="comments-container" v-loading="loading">
      <div class="comments-header">
        <el-statistic title="评论总数" :value="comments.length" />
        <el-button type="primary" @click="$emit('refresh')" :icon="Refresh" circle />
      </div>

      <el-divider />

      <div class="comments-list" v-if="comments.length > 0">
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="comment-item"
        >
          <div class="comment-header">
            <div class="user-info">
              <el-avatar :src="comment.avatar" :size="40">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ comment.username || '匿名用户' }}</div>
                <div class="comment-time">{{ formatDateTime(comment.createdAt) }}</div>
              </div>
            </div>
            <div class="comment-actions">
              <el-rate :model-value="comment.rating" disabled :size="18" />
              <el-button 
                type="danger" 
                size="small" 
                :icon="Delete"
                @click="handleDeleteComment(comment)"
                link
              >
                删除
              </el-button>
            </div>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
        </div>
      </div>

      <el-empty 
        v-else 
        description="暂无评论" 
        :image-size="120"
      />
    </div>
  </el-dialog>
</template>

<script setup>
import { User, Refresh, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteCommentApi } from '@/api/survey';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  survey: {
    type: Object,
    default: null
  },
  comments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'refresh']);

const formatDateTime = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString("zh-CN");
  } catch (error) {
    return '';
  }
};

const handleDeleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？',
      '删除评论',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteCommentApi(comment.surveyId, comment.answerId, comment.commentId);
    ElMessage.success('评论删除成功');
    emit('refresh');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除评论失败：' + error.message);
    }
  }
};
</script>

<style scoped lang="scss">
.comments-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.comments-container {
  max-height: 600px;
  overflow-y: auto;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #ebeef5;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-details {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .username {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .comment-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .comment-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  .comment-content {
    padding: 12px;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    word-break: break-word;
  }
}
</style>
