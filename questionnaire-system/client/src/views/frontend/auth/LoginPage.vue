<template>
  <div class="login-page">
    <el-button class="back-home-btn" text @click="goHome">
      <el-icon>
        <ArrowLeft />
      </el-icon>
      返回首页
    </el-button>

    <el-card class="box">
      <div class="logo-title">
        <h2>问卷系统</h2>
      </div>

      <el-tabs v-model="activeTab" class="auth-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" @submit.prevent>
            <el-form-item label="邮箱/用户名">
              <el-input
                v-model="loginForm.email"
                placeholder="请输入邮箱"
              ></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
              ></el-input>
            </el-form-item>
            <div class="form-footer">
              <el-button
                type="text"
                class="forgot-password-btn"
                @click="goToResetPassword"
              >
                忘记密码？
              </el-button>
            </div>
            <el-form-item>
              <el-button
                type="primary"
                @click="submitLogin"
                :loading="loginLoading"
                class="login-button"
                >登录</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" @submit.prevent>
            <el-form-item label="邮箱">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
              ></el-input>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
              ></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input
                v-model="registerForm.nickname"
                placeholder="请输入昵称"
              ></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="submitRegister"
                :loading="registerLoading"
                >注册</el-button
              >
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
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import apiClient from "@/api/index.js";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref("login");
const loginLoading = ref(false);
const registerLoading = ref(false);

const loginForm = reactive({ email: "", password: "" });
const registerForm = reactive({
  email: "",
  username: "",
  nickname: "",
  password: "",
});

const submitLogin = async () => {
  loginLoading.value = true;
  try {
    const response = await loginAuth(loginForm);
    // 处理不同的响应格式
    const { token, user } = response.data || response;

    userStore.setToken(token);
    userStore.setProfile(user);

    ElMessage.success("登录成功！");

    // 处理登录后的首次/非首次逻辑（首次登录在此弹首次登录奖励；非首次登录由首页触发每日登录奖励）
    await userStore.handlePostLogin();

    // 检查是否有被退回的问卷
    await checkRejectedSurveys(user);

    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/home");
    }
  } catch (error) {
    console.error("登录失败:", error);
    ElMessage.error(error.message || "登录失败，请重试");
  } finally {
    loginLoading.value = false;
  }
};

// 检查被退回的问卷
const checkRejectedSurveys = async (user) => {
  if (!user || user.role === "admin") return;

  try {
    // 使用统一的 API 调用
    const allSurveys = await apiClient.get("/surveys");
    const userId = user.id;

    // 筛选当前用户被退回的问卷
    const rejectedSurveys = allSurveys.filter(
      (s) =>
        (s.userId === userId || s.authorId === userId) &&
        s.status === "rejected"
    );

    // 如果有被退回的问卷，显示提醒
    if (rejectedSurveys.length > 0) {
      const messageContent = rejectedSurveys
        .map((survey, index) => {
          return `<div style="margin-bottom: 12px; padding: 10px; border-left: 3px solid #f56c6c; background: #fef0f0; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 6px; color: #f56c6c;">
            ${index + 1}. ${survey.title}
          </div>
          <div style="font-size: 14px; color: #606266;">
            退回原因: ${survey.rejectedReason || "未提供原因"}
          </div>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            退回时间: ${new Date(
              survey.rejectedAt || survey.updatedAt
            ).toLocaleString("zh-CN")}
          </div>
        </div>`;
        })
        .join("");

      setTimeout(() => {
        ElMessageBox({
          title: `您有 ${rejectedSurveys.length} 个问卷被退回`,
          message: messageContent,
          dangerouslyUseHTMLString: true,
          confirmButtonText: "前往查看",
          cancelButtonText: "稍后处理",
          showCancelButton: true,
          type: "warning",
          customStyle: {
            width: "550px",
          },
        })
          .then(() => {
            router.push("/profile/questionnaires/created");
          })
          .catch(() => {
            // 用户点击稍后处理
          });
      }, 500);
    }
  } catch (error) {
    console.error("检查被退回问卷失败:", error);
  }
};

const submitRegister = async () => {
  if (!registerForm.email || !registerForm.username || !registerForm.password) {
    ElMessage.error("请填写完整信息");
    return;
  }

  registerLoading.value = true;
  try {
    await registerAuth(registerForm);
    ElMessage.success("注册成功！请登录");

    // 切换到登录标签页
    activeTab.value = "login";

    // 清空注册表单
    Object.assign(registerForm, {
      email: "",
      username: "",
      nickname: "",
      password: "",
    });
  } catch (error) {
    console.error("注册失败:", error);
    ElMessage.error(error.message || "注册失败，请重试");
  } finally {
    registerLoading.value = false;
  }
};

const goHome = () => router.push("/home");

const goToResetPassword = () => {
  router.push("/reset-password");
};
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    145deg,
    var(--theme-background-color),
    var(--bg-primary-light)
  );
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-family: "HarmonyOS Sans", "Microsoft YaHei", sans-serif;

  // ====== 返回首页按钮 ======
  .back-home-btn {
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

  .logo-title {
    text-align: center;
    margin-bottom: 10px;

    h2 {
      font-size: 24px;
      color: var(--color-primary-dark-3);
      font-weight: 700;
    }
  }

  .box {
    width: 420px;
    background: linear-gradient(
      145deg,
      var(--text-inverse) ff 0%,
      #f8fff9 100%
    );
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(37, 146, 52, 0.15),
      0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    overflow: hidden;

    animation: slideInUp 0.6s ease-out;
  }

  .auth-tabs {
    padding: 20px;
    .login-button {
      width: 100%;
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: -10px;
      margin-bottom: 10px;

      .forgot-password-btn {
        font-size: 13px;
        padding: 0;
        height: auto;
        color: var(--color-primary);

        &:hover {
          color: var(--color-primary-dark-2);
          background: transparent;
        }
      }
    }
  }

  :deep(.el-form-item) {
    display: block;
  }

  :deep(.el-form-item:last-child) {
    margin-bottom: 0;
    margin-top: 30px;
    text-align: center;

    :deep(.el-button) {
      margin: 0 10px;
    }
  }

  // 深度选择器样式保持为 :deep 形式,放在 .login-page 内以限定作用域
  :deep(.el-tabs__header) {
    margin-bottom: 30px;
    border-bottom: 2px solid rgba(37, 146, 52, 0.1);
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
    color: var(--color-primary);
  }

  :deep(.el-tabs__item.is-active) {
    color: var(--color-primary);
    border-radius: 10px 10px 0 0;
    position: relative;
  }

  :deep(.el-tabs__active-bar) {
    background: linear-gradient(
      90deg,
      var(--color-primary) 0%,
      var(--color-primary-light-2) 100%
    );
    height: 3px;
    border-radius: 2px;
    bottom: 0;
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
  }

  :deep(.el-input__wrapper:hover) {
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px rgba(37, 146, 52, 0.2);
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px rgba(37, 146, 52, 0.3);
  }

  // 移除 autocomplete 自动填充的背景色
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(37, 146, 52, 0.1);
    border: 1px solid rgba(37, 146, 52, 0.2);
    transition: all 0.3s ease;
    background-color: #ffffff !important;
  }

  :deep(.el-input__inner) {
    background-color: transparent !important;

    // 移除浏览器自动填充的背景色
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
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-primary-light-2) 100%
    );
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

  :deep(.el-button--text) {
    color: var(--color-primary);
    font-weight: 500;
    border-radius: 20px;
    padding: 8px 16px;
    transition: all 0.3s ease;
  }

  :deep(.el-button--text:hover) {
    background: rgba(37, 146, 52, 0.1);
    color: var(--color-primary-dark-2);
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

  // 响应式
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
}
</style>
