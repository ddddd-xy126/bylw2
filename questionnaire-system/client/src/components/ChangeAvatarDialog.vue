<template>
  <el-dialog
    v-model="visible"
    title="更换头像"
    width="600px"
    :destroy-on-close="true"
    :append-to-body="true"
    class="avatar-dialog"
    @close="handleClose"
  >
    <div class="avatar-upload-section">
      <div class="current-avatar">
        <h4>当前头像</h4>
        <el-avatar :size="80" :src="currentAvatar">
          {{ avatarFallback }}
        </el-avatar>
      </div>

      <div class="upload-area">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="handleAvatarUpload"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            选择图片
          </el-button>
          <div class="upload-tip">
            支持 JPG、PNG 格式，建议尺寸 200x200px，大小不超过 2MB
          </div>
        </el-upload>
      </div>

      <div class="preset-avatars">
        <h4>选择预设头像</h4>
        <div class="avatars-grid">
          <div
            v-for="avatar in presetAvatars"
            :key="avatar.id"
            class="preset-avatar"
            :class="{ active: selectedAvatar === avatar.url }"
            @click="selectPresetAvatar(avatar.url)"
          >
            <el-avatar :size="60" :src="avatar.url" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="saveAvatar" :loading="savingAvatar">
        保存头像
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "success"]);

const userStore = useUserStore();
const savingAvatar = ref(false);
const selectedAvatar = ref("");

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      // 打开对话框时,初始化选中的头像为当前头像
      selectedAvatar.value = currentAvatar.value;
    }
  }
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

// 当前头像
const currentAvatar = computed(() => {
  return (
    userStore.profile?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${
      userStore.profile?.username || "User"
    }`
  );
});

// 头像备用显示(首字母)
const avatarFallback = computed(() => {
  const profile = userStore.profile;
  return profile?.nickname?.charAt(0) || profile?.username?.charAt(0) || "U";
});

// 预设头像列表
const presetAvatars = ref([
  { id: 1, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin1" },
  { id: 2, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin2" },
  { id: 3, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin3" },
  { id: 4, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin4" },
  {
    id: 5,
    url: "https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=3b82f6",
  },
  {
    id: 6,
    url: "https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=10b981",
  },
  {
    id: 7,
    url: "https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=f59e0b",
  },
  {
    id: 8,
    url: "https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=ef4444",
  },
]);

const handleClose = () => {
  visible.value = false;
  selectedAvatar.value = "";
};

const selectPresetAvatar = (url) => {
  selectedAvatar.value = url;
};

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error("头像图片只能是 JPG 或 PNG 格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

const handleAvatarUpload = ({ file }) => {
  // 这里应该上传到服务器，现在只是预览
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedAvatar.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const saveAvatar = async () => {
  if (!selectedAvatar.value) {
    ElMessage.warning("请选择头像");
    return;
  }

  try {
    savingAvatar.value = true;

    // 获取当前用户信息
    const currentProfile = userStore.profile;
    if (!currentProfile) {
      throw new Error("用户未登录");
    }

    // 准备更新数据
    const updatedData = {
      avatar: selectedAvatar.value,
      updatedAt: new Date().toISOString(),
    };

    // 调用API更新头像
    const { updateProfileApi } = await import("@/api/user.js");
    const result = await updateProfileApi(currentProfile.id, updatedData);

    // 同步更新 userStore 中的头像
    const newProfile = {
      ...currentProfile,
      avatar: selectedAvatar.value,
    };
    userStore.setProfile(newProfile);

    ElMessage.success("头像更新成功");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("头像更新错误:", error);
    ElMessage.error(error.message || "头像更新失败");
  } finally {
    savingAvatar.value = false;
  }
};
</script>

<style scoped lang="scss">
.avatar-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }
}

.avatar-upload-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-avatar {
  text-align: center;

  h4 {
    margin: 0 0 16px 0;
    color: #1a202c;
  }
}

.upload-area {
  text-align: center;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.preset-avatars {
  h4 {
    margin: 0 0 16px 0;
    color: #1a202c;
  }

  .avatars-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .preset-avatar {
    padding: 8px;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover,
    &.active {
      border-color: var(--color-primary-light-3);
      background: rgba(64, 158, 255, 0.1);
    }
  }
}
</style>
