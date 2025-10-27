<template>
  <div class="info-page">
    <div class="page-header">
      <h2>个人信息</h2>
      <p>管理您的个人资料和账户设置</p>
      <el-button type="success" plain @click="showPasswordDialog = true" class="password-button">
        修改密码
      </el-button>
    </div>

    <div class="info-content">
      <!-- 基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon>
              <User />
            </el-icon>
            <span>基本信息</span>
            <el-button type="success" size="small" :icon="Edit" @click="editMode = !editMode">
              {{ editMode ? '取消编辑' : '编辑资料' }}
            </el-button>
          </div>
        </template>

        <el-form ref="userInfoForm" :model="userInfo" :rules="formRules" label-width="100px" :disabled="!editMode">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userInfo.username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-select v-model="userInfo.gender" placeholder="请选择性别">
                  <el-option label="男" value="male" />
                  <el-option label="女" value="female" />
                  <el-option label="保密" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="生日" prop="birthday">
                <el-date-picker v-model="userInfo.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="职业" prop="occupation">
                <el-input v-model="userInfo.occupation" placeholder="请输入职业" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="个人简介" prop="bio">
            <el-input v-model="userInfo.bio" type="textarea" :rows="4" placeholder="介绍一下自己吧..." maxlength="500"
              show-word-limit />
          </el-form-item>

          <el-form-item label="个人标签" prop="tags">
            <el-select
              v-model="userInfo.tags"
              multiple
              filterable
              allow-create
              placeholder="添加或选择个人标签"
            >
              <el-option
                v-for="tag in tagOptions"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
            <div class="el-form-item__tip" style="margin-top:6px; color:#909399; font-size:12px;">可选择已有标签或输入自定义标签（爱好 / 喜好 / 风格），默认会显示全部已选标签，只有在空间不足时才折叠。</div>
          </el-form-item>

          <el-form-item v-if="editMode">
            <el-button type="primary" @click="saveUserInfo" :loading="saving">
              保存修改
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 账户统计 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <span>账户统计</span>
          </div>
        </template>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalQuestionnaires }}</div>
            <div class="stat-label">创建问卷</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalAnswers }}</div>
            <div class="stat-label">参与问卷</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalPoints }}</div>
            <div class="stat-label">获得积分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalCollections }}</div>
            <div class="stat-label">收藏问卷</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px" top="250px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
            </el-form-item>
          </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="changingPassword">
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Edit, DataAnalysis, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

// 响应式数据
const editMode = ref(false);
const saving = ref(false);
const sendingEmail = ref(false);
const changingPassword = ref(false);
const showPasswordDialog = ref(false);

// 用户信息 - 从store获取真实数据
const userInfo = reactive({
  username: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  occupation: '',
  bio: '',
  // 个人标签，多选字符串数组
  tags: []
});

// 用户统计 - 从API获取真实数据
const userStats = reactive({
  totalQuestionnaires: 0,
  totalAnswers: 0,
  totalPoints: 0,
  totalCollections: 0
});

// 预设标签选项（表示个人爱好/喜好/风格），改为从后端加载
const tagOptions = ref([]);

// 从 json-server 加载现有标签（从 surveys 和 users 两个资源收集 tags 字段作为预设）
const loadTagOptions = async () => {
  try {
    // 动态导入 api client，避免循环依赖
    const apiClient = (await import('@/api/index.js')).default;

    const [surveys, users] = await Promise.all([
      apiClient.get('/surveys'),
      apiClient.get('/users')
    ]);

    const set = new Set();

    // 收集 surveys.tags
    if (Array.isArray(surveys)) {
      surveys.forEach(s => {
        if (Array.isArray(s.tags)) {
          s.tags.forEach(t => t && set.add(String(t)));
        }
      });
    }

    // 收集 users.tags
    if (Array.isArray(users)) {
      users.forEach(u => {
        if (Array.isArray(u.tags)) {
          u.tags.forEach(t => t && set.add(String(t)));
        }
      });
    }

    // 如果没有收集到任何标签，提供少量默认项作为兜底
    if (set.size === 0) {
      ['音乐', '电影', '阅读', '旅行', '摄影', '运动', '美食', '游戏'].forEach(t => set.add(t));
    }

    tagOptions.value = Array.from(set);
    console.log('标签预设已加载:', tagOptions.value);
  } catch (err) {
    console.error('加载标签预设失败:', err);
    // 兜底默认标签
    tagOptions.value = ['音乐', '电影', '阅读', '旅行', '摄影', '运动', '美食', '游戏'];
  }
};

// 密码修改表单
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

const passwordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 表单引用
const userInfoForm = ref();
const passwordFormRef = ref();

// 方法 - 从store和API获取真实数据
const loadUserInfo = () => {
  // 从用户store获取profile数据
  const profile = userStore.profile;
  if (profile) {
    Object.assign(userInfo, {
      username: profile.username || '',
      email: profile.email || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      birthday: profile.birthday || '',
      occupation: profile.profession || '',
      bio: profile.bio || '',
      tags: profile.tags || []
    });
  }
  console.log('用户信息已加载:', userInfo);
};

const loadUserStats = async () => {
  try {
    // 从用户store获取基本统计
    const profile = userStore.profile;
    if (profile) {
      userStats.totalPoints = profile.points || 0;
    }

    // 获取收藏数量
    userStats.totalCollections = userStore.favorites?.length || 0;

    // 获取答题数量 - 从answers数据获取
    userStats.totalAnswers = userStore.answers?.length || 0;

    // 获取创建问卷数量 - 这里可以通过API获取
    // 暂时设为0，后续可以添加API调用
    userStats.totalQuestionnaires = 0;

    console.log('用户统计已加载:', userStats);
  } catch (error) {
    console.error('加载用户统计失败:', error);
  }
};

const saveUserInfo = async () => {
  if (!userInfoForm.value) return;

  try {
    await userInfoForm.value.validate();
    saving.value = true;

    // 获取当前用户信息
    const currentProfile = userStore.profile;
    if (!currentProfile) {
      throw new Error('用户未登录');
    }

    // 准备更新数据
    const updatedData = {
      ...currentProfile,
      username: userInfo.username,
      email: userInfo.email,
      phone: userInfo.phone,
      gender: userInfo.gender,
      profession: userInfo.occupation,
      bio: userInfo.bio,
      // 将 tags 字段保存到 json-server
      tags: Array.isArray(userInfo.tags) ? userInfo.tags : [],
      updatedAt: new Date().toISOString()
    };

    // 调用API更新用户信息
    const { updateProfileApi } = await import('@/api/user.js');
    await updateProfileApi(currentProfile.id, updatedData);

    // 更新store中的用户信息
    userStore.setProfile(updatedData);

    ElMessage.success('个人信息更新成功');
    editMode.value = false;

    console.log('用户信息已保存:', updatedData);
  } catch (error) {
    console.error('保存用户信息失败:', error);
    ElMessage.error(error.message || '保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  editMode.value = false;
  loadUserInfo(); // 重新加载原始数据
  if (userInfoForm.value) {
    userInfoForm.value.clearValidate();
  }
};

const sendVerificationEmail = async () => {
  try {
    sendingEmail.value = true;

    // 模拟发送邮件延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    ElMessage.success('验证邮件已发送，请检查您的邮箱');
    console.log('验证邮件已发送（模拟）');
  } catch (error) {
    console.error('发送验证邮件失败:', error);
    ElMessage.error('发送失败，请重试');
  } finally {
    sendingEmail.value = false;
  }
};

const changePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    changingPassword.value = true;

    // 调用后端 API 直接更新用户密码（不再校验当前密码）
    const currentProfile = userStore.profile;
    if (!currentProfile) {
      throw new Error('用户未登录');
    }

    const { updateProfileApi } = await import('@/api/user.js');
    // 只 patch 密码字段，json-server 会持久化到 db.json
    await updateProfileApi(currentProfile.id, { password: passwordForm.newPassword });

    // 同步更新本地 store（保留其他字段）
    const updatedProfile = { ...currentProfile, password: passwordForm.newPassword };
    userStore.setProfile(updatedProfile);

    ElMessage.success('密码修改成功');
    showPasswordDialog.value = false;

    // 清空表单
    Object.assign(passwordForm, {
      newPassword: '',
      confirmPassword: ''
    });

    console.log('密码已修改并已同步到 json-server');
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error(error.message || '修改密码失败，请重试');
  } finally {
    changingPassword.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadUserInfo();
  loadUserStats();
  loadTagOptions();
});
</script>

<style scoped lang="scss">
.info-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.password-button {
  position: absolute;
  font-size: 12px;
  top: 40px;
  right: 40px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray-800);
}

.page-header p {
  margin: 0;
  color: var(--color-gray-800);

  font-size: 14px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.card-header .el-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--color-primary-light-1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  padding: 16px 0;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary-light-1);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info {
  flex: 1;
}

.security-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.security-desc {
  font-size: 14px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-page {
    padding: 0;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .security-item .el-button,
  .security-item .el-tag {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>