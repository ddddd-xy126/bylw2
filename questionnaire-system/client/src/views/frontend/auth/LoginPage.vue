<template>
  <div class="login-page">
    <el-card class="box">
      <el-tabs v-model="activeTab" class="auth-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" @submit.prevent>
            <el-form-item label="邮箱">
              <el-input v-model="loginForm.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitLogin" :loading="loginLoading">登录</el-button>
              <el-button type="text" @click="goHome">返回首页</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" @submit.prevent>
            <el-form-item label="邮箱">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="registerForm.nickname" placeholder="请输入昵称"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitRegister" :loading="registerLoading">注册</el-button>
              <el-button type="text" @click="goHome">返回首页</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { login as loginAuth, register as registerAuth } from "@/api/auth";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref('login');
const loginLoading = ref(false);
const registerLoading = ref(false);

const loginForm = reactive({ email: "", password: "" });
const registerForm = reactive({ 
  email: "", 
  username: "", 
  nickname: "", 
  password: "" 
});

const submitLogin = async () => {
  loginLoading.value = true;
  try {
    const response = await loginAuth(loginForm);
    // 处理不同的响应格式
    const { token, user } = response.data || response;
    
    userStore.setToken(token);
    userStore.setProfile(user);
    
    ElMessage.success('登录成功！');
    
    // redirect admin to admin dashboard, others to home
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/home");
    }
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error(error.message || '登录失败，请重试');
  } finally {
    loginLoading.value = false;
  }
};

const submitRegister = async () => {
  if (!registerForm.email || !registerForm.username || !registerForm.password) {
    ElMessage.error('请填写完整信息');
    return;
  }
  
  registerLoading.value = true;
  try {
    await registerAuth(registerForm);
    ElMessage.success('注册成功！请登录');
    
    // 切换到登录标签页
    activeTab.value = 'login';
    
    // 清空注册表单
    Object.assign(registerForm, {
      email: "", 
      username: "", 
      nickname: "", 
      password: ""
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    ElMessage.error(error.message || '注册失败，请重试');
  } finally {
    registerLoading.value = false;
  }
};

const goHome = () => router.push("/home");
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.box {
  width: 420px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(102, 126, 234, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.auth-tabs {
  padding: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

:deep(.el-tabs__nav-wrap::after) {
  background: transparent;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  padding: 0 30px;
  height: 50px;
  line-height: 50px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item:hover) {
  color: #667eea;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 10px 10px 0 0;
}

:deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  height: 3px;
  border-radius: 2px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

:deep(.el-button--text) {
  color: #667eea;
  font-weight: 500;
  border-radius: 20px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

:deep(.el-button--text:hover) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-form-item:last-child {
  margin-bottom: 0;
  margin-top: 30px;
  text-align: center;
}

.el-form-item:last-child .el-button {
  margin: 0 10px;
}

/* 添加进入动画 */
.box {
  animation: slideInUp 0.6s ease-out;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .box {
    width: 90%;
    max-width: 380px;
    margin: 20px;
  }
  
  .auth-tabs {
    padding: 15px;
  }
  
  :deep(.el-tabs__item) {
    padding: 0 20px;
    font-size: 14px;
  }
}
</style>
