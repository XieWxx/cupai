<template>
  <div class="login-view">
    <div class="login-card">
      <h1 class="login-title">⚽ CupAI</h1>
      <el-tabs v-model="activeTab">
        <!-- 登录 -->
        <el-tab-pane :label="$t('common.login') || '登录'" name="login">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" :placeholder="$t('common.username') || '用户名'" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" :placeholder="$t('common.password') || '密码'" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" style="width: 100%" :loading="loading" native-type="submit">
              {{ $t('common.login') || '登录' }}
            </el-button>
          </el-form>
        </el-tab-pane>
        <!-- 注册 -->
        <el-tab-pane :label="$t('common.register') || '注册'" name="register">
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" @submit.prevent="handleRegister">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" :placeholder="$t('common.username') || '用户名'" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="nickname">
              <el-input v-model="registerForm.nickname" :placeholder="$t('common.nickname') || '昵称'" prefix-icon="UserFilled" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" :placeholder="$t('common.password') || '密码'" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" style="width: 100%" :loading="loading" native-type="submit">
              {{ $t('common.register') || '注册' }}
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)

// 登录表单
const loginForm = reactive({ username: '', password: '' })
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 注册表单
const registerForm = reactive({ username: '', nickname: '', password: '' })
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名3-50个字符', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
}

async function handleLogin() {
  loading.value = true
  try {
    await userStore.login(loginForm)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  try {
    await userStore.register(registerForm)
    ElMessage.success('注册成功')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '注册失败')
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
