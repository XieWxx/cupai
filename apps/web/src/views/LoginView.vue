<template>
  <div class="login-view">
    <div class="login-card">
      <h1 class="login-title">⚽ {{ $t('common.appName') }}</h1>
      <el-tabs v-model="activeTab">
        <!-- 登录 -->
        <el-tab-pane :label="$t('common.login')" name="login">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" :placeholder="$t('login.enterUsername')" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" :placeholder="$t('login.enterPassword')" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" style="width: 100%" :loading="loading" native-type="submit">
              {{ $t('common.login') }}
            </el-button>
          </el-form>
        </el-tab-pane>
        <!-- 注册 -->
        <el-tab-pane :label="$t('common.register')" name="register">
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" @submit.prevent="handleRegister">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" :placeholder="$t('login.enterUsername')" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="nickname">
              <el-input v-model="registerForm.nickname" :placeholder="$t('login.enterNickname')" prefix-icon="UserFilled" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" :placeholder="$t('login.enterPassword')" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" style="width: 100%" :loading="loading" native-type="submit">
              {{ $t('common.register') }}
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)

// 登录表单
const loginForm = reactive({ username: '', password: '' })
const loginRules = computed(() => ({
  username: [{ required: true, message: t('login.enterUsername'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.enterPassword'), trigger: 'blur' }],
}))

// 注册表单
const registerForm = reactive({ username: '', nickname: '', password: '' })
const registerRules = computed(() => ({
  username: [
    { required: true, message: t('login.enterUsername'), trigger: 'blur' },
    { min: 3, max: 50, message: t('login.usernameLength'), trigger: 'blur' },
  ],
  nickname: [{ required: true, message: t('login.enterNickname'), trigger: 'blur' }],
  password: [
    { required: true, message: t('login.enterPassword'), trigger: 'blur' },
    { min: 6, message: t('login.passwordLength'), trigger: 'blur' },
  ],
}))

async function handleLogin() {
  loading.value = true
  try {
    await userStore.login(loginForm)
    ElMessage.success(t('login.loginSuccess'))
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('login.loginFail'))
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  try {
    await userStore.register(registerForm)
    ElMessage.success(t('login.registerSuccess'))
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || t('login.registerFail'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 24px;
  color: #1a1a2e;
}
</style>
