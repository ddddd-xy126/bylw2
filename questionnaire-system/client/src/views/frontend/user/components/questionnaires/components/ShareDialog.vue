<template>
  <el-dialog 
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="分享问卷" 
    width="500px" 
    :append-to-body="true" 
    :destroy-on-close="true"
    :z-index="3000"
  >
    <div class="share-content">
      <div class="share-item">
        <label>问卷链接：</label>
        <el-input :model-value="shareUrl" readonly @click="selectText">
          <template #append>
            <el-button @click="copyLink">复制</el-button>
          </template>
        </el-input>
      </div>

      <div class="share-item">
        <label>二维码：</label>
        <div class="qr-code">
          <el-image :src="qrCodeUrl" alt="问卷二维码" style="width: 120px; height: 120px;" />
        </div>
      </div>

      <div class="share-item">
        <label>社交分享：</label>
        <div class="social-share">
          <el-button @click="shareToQQ">QQ</el-button>
          <el-button @click="shareToWeibo">微博</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  shareUrl: {
    type: String,
    default: ''
  },
  qrCodeUrl: {
    type: String,
    default: ''
  },
  survey: {
    type: Object,
    default: null
  }
});

defineEmits(['update:visible']);

const selectText = (event) => {
  event.target.select();
};

const copyLink = () => {
  navigator.clipboard.writeText(props.shareUrl).then(() => {
    ElMessage.success("链接已复制到剪贴板");
  });
};

const shareToQQ = () => {
  const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(props.shareUrl)}&title=${encodeURIComponent(props.survey?.title || '问卷调查')}`;
  window.open(url, '_blank');
};

const shareToWeibo = () => {
  const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(props.shareUrl)}&title=${encodeURIComponent(props.survey?.title || '问卷调查')}`;
  window.open(url, '_blank');
};
</script>

<style scoped lang="scss">
.share-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.share-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: #303133;
  }
}

.qr-code {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.social-share {
  display: flex;
  gap: 12px;
}
</style>
