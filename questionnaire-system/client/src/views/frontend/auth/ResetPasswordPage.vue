<template>
  <div class="reset-password-page">
    <el-button class="back-btn" text @click="goBack">
      <el-icon>
        <ArrowLeft />
      </el-icon> 返回登录
    </el-button>

    <el-card class="box">
      <div class="logo-title">
        <h2>重置密码</h2>
        <p>请输入您的邮箱和新密码</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入注册邮箱" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitReset" :loading="loading" class="submit-btn">
            重置密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft } from '@element-plus/icons-vue';
import { resetPassword } from "@/api/auth";

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  email: "",
  password: "",
  confirmPassword: ""
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const submitReset = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      const response = await resetPassword({
        email: form.email,
        password: form.password
      });

      ElMessage.success('密码重置成功！请使用新密码登录');

      // 延迟跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (error) {
      console.error('重置密码失败:', error);
      ElMessage.error(error.message || '重置密码失败，请重试');
    } finally {
      loading.value = false;
    }
  });
};

const goBack = () => {
  router.push('/login');
};
</script>

<style scoped lang="scss">
.reset-password-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(145deg,
      var(--theme-background-color),
      var(--bg-primary-light));
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-family: "HarmonyOS Sans", "Microsoft YaHei", sans-serif;

  .back-btn {
    position: absolute;
    top: var(--spacing-lg);
    left: var(--spacing-lg);
    transition: var(--transition-base);
    color: var(--color-primary-dark-2);
    font-weight: 500;

    .el-icon {
      margin-right: 6px;
      font-size: 18px;
    }

    &:hover {
      color: var(--color-primary);
      background-color: transparent;
      transform: translateX(-2px);
    }
  }

  .box {
    width: 420px;
    background: linear-gradient(145deg, var(--text-inverse)ff 0%, #f8fff9 100%);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(37, 146, 52, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    padding: 40px 30px;
    animation: slideInUp 0.6s ease-out;
  }

  .logo-title {
    text-align: center;
    margin-bottom: 30px;

    h2 {
      font-size: 24px;
      color: var(--color-primary-dark-3);
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .submit-btn {
    width: 100%;
    margin-top: 10px;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(37, 146, 52, 0.1);
    border: 1px solid rgba(37, 146, 52, 0.2);
    transition: all 0.3s ease;
    background-color: #ffffff !important;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px rgba(37, 146, 52, 0.2);
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px rgba(37, 146, 52, 0.3);
  }

  :deep(.el-form-item) {
    display: block;
  }

  :deep(.el-input__inner) {
    background-color: transparent !important;

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
      -webkit-text-fill-color: var(--text-primary) !important;
      background-color: transparent !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  :deep(.el-button--primary) {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light-2) 100%);
    border: none;
    border-radius: 25px;
    padding: 12px 30px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(37, 146, 52, 0.3);
  }

  :deep(.el-button--primary:hover) {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(37, 146, 52, 0.4);
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .box {
      width: 90%;
      max-width: 380px;
      margin: 20px;
      padding: 30px 20px;
    }
  }
}
</style>
