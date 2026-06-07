<template>
  <div class="login-view">
    <div class="login-card">
      <h1 class="login-title">⚽ {{ $t('common.appName') }}</h1>
      <p class="login-desc">{{ $t('login.welcomeDesc') }}</p>
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
            <el-button type="primary" class="login-btn" :loading="loading" native-type="submit">
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
            <el-form-item prop="region" :label="$t('login.countryLabel')">
              <el-select v-model="registerForm.region" :placeholder="$t('login.selectCountry')" filterable>
                <el-option
                  v-for="item in countryList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                >
                  <span :class="`fi fi-${item.code.toLowerCase()} country-flag`" />
                  <span style="margin-left: 8px">{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" :placeholder="$t('login.enterPassword')" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" class="login-btn" :loading="loading" native-type="submit">
              {{ $t('common.register') }}
            </el-button>
            <p class="register-notice">
              ⚠️ {{ $t('login.registerNotice') }}
            </p>
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
const registerForm = reactive({ username: '', nickname: '', region: '', password: '' })
const registerRules = computed(() => ({
  username: [
    { required: true, message: t('login.enterUsername'), trigger: 'blur' },
    { min: 3, max: 50, message: t('login.usernameLength'), trigger: 'blur' },
  ],
  nickname: [{ required: true, message: t('login.enterNickname'), trigger: 'blur' }],
  region: [{ required: true, message: t('login.selectCountry'), trigger: 'change' }],
  password: [
    { required: true, message: t('login.enterPassword'), trigger: 'blur' },
    { min: 6, message: t('login.passwordLength'), trigger: 'blur' },
  ],
}))

// 世界各国列表（按 ISO 3166-1 alpha-2）
const countryList = [
  { code: 'cn', name: '🇨🇳 中国' },
  { code: 'us', name: '🇺🇸 United States' },
  { code: 'gb', name: '🇬🇧 United Kingdom' },
  { code: 'fr', name: '🇫🇷 France' },
  { code: 'de', name: '🇩🇪 Germany' },
  { code: 'jp', name: '🇯🇵 Japan' },
  { code: 'kr', name: '🇰🇷 South Korea' },
  { code: 'ru', name: '🇷🇺 Russia' },
  { code: 'in', name: '🇮🇳 India' },
  { code: 'br', name: '🇧🇷 Brazil' },
  { code: 'ca', name: '🇨🇦 Canada' },
  { code: 'au', name: '🇦🇺 Australia' },
  { code: 'mx', name: '🇲🇽 Mexico' },
  { code: 'it', name: '🇮🇹 Italy' },
  { code: 'es', name: '🇪🇸 Spain' },
  { code: 'nl', name: '🇳🇱 Netherlands' },
  { code: 'se', name: '🇸🇪 Sweden' },
  { code: 'no', name: '🇳🇴 Norway' },
  { code: 'dk', name: '🇩🇰 Denmark' },
  { code: 'fi', name: '🇫🇮 Finland' },
  { code: 'ch', name: '🇨🇭 Switzerland' },
  { code: 'at', name: '🇦🇹 Austria' },
  { code: 'pl', name: '🇵🇱 Poland' },
  { code: 'be', name: '🇧🇪 Belgium' },
  { code: 'cz', name: '🇨🇿 Czechia' },
  { code: 'pt', name: '🇵🇹 Portugal' },
  { code: 'gr', name: '🇬🇷 Greece' },
  { code: 'tr', name: '🇹🇷 Turkey' },
  { code: 'ua', name: '🇺🇦 Ukraine' },
  { code: 'ro', name: '🇷🇴 Romania' },
  { code: 'hu', name: '🇭🇺 Hungary' },
  { code: 'rs', name: '🇷🇸 Serbia' },
  { code: 'hr', name: '🇭🇷 Croatia' },
  { code: 'ie', name: '🇮🇪 Ireland' },
  { code: 'nz', name: '🇳🇿 New Zealand' },
  { code: 'sg', name: '🇸🇬 Singapore' },
  { code: 'id', name: '🇮🇩 Indonesia' },
  { code: 'th', name: '🇹🇭 Thailand' },
  { code: 'vn', name: '🇻🇳 Vietnam' },
  { code: 'ph', name: '🇵🇭 Philippines' },
  { code: 'my', name: '🇲🇾 Malaysia' },
  { code: 'ar', name: '🇦🇷 Argentina' },
  { code: 'co', name: '🇨🇴 Colombia' },
  { code: 'pe', name: '🇵🇪 Peru' },
  { code: 'cl', name: '🇨🇱 Chile' },
  { code: 'ec', name: '🇪🇨 Ecuador' },
  { code: 'uy', name: '🇺🇾 Uruguay' },
  { code: 'py', name: '🇵🇾 Paraguay' },
  { code: 'bo', name: '🇧🇴 Bolivia' },
  { code: 've', name: '🇻🇪 Venezuela' },
  { code: 'cr', name: '🇨🇷 Costa Rica' },
  { code: 'pa', name: '🇵🇦 Panama' },
  { code: 'gt', name: '🇬🇹 Guatemala' },
  { code: 'hn', name: '🇭🇳 Honduras' },
  { code: 'sv', name: '🇸🇻 El Salvador' },
  { code: 'ni', name: '🇳🇮 Nicaragua' },
  { code: 'cu', name: '🇨🇺 Cuba' },
  { code: 'do', name: '🇩🇴 Dominican Republic' },
  { code: 'za', name: '🇿🇦 South Africa' },
  { code: 'eg', name: '🇪🇬 Egypt' },
  { code: 'ma', name: '🇲🇦 Morocco' },
  { code: 'tn', name: '🇹🇳 Tunisia' },
  { code: 'ng', name: '🇳🇬 Nigeria' },
  { code: 'ke', name: '🇰🇪 Kenya' },
  { code: 'gh', name: '🇬🇭 Ghana' },
  { code: 'et', name: '🇪🇹 Ethiopia' },
  { code: 'sn', name: '🇸🇳 Senegal' },
  { code: 'cm', name: '🇨🇲 Cameroon' },
  { code: 'ci', name: '🇨🇮 Ivory Coast' },
  { code: 'dz', name: '🇩🇿 Algeria' },
  { code: 'sa', name: '🇸🇦 Saudi Arabia' },
  { code: 'ae', name: '🇦🇪 United Arab Emirates' },
  { code: 'qa', name: '🇶🇦 Qatar' },
  { code: 'ir', name: '🇮🇷 Iran' },
  { code: 'iq', name: '🇮🇶 Iraq' },
  { code: 'il', name: '🇮🇱 Israel' },
  { code: 'jo', name: '🇯🇴 Jordan' },
  { code: 'lb', name: '🇱🇧 Lebanon' },
  { code: 'kw', name: '🇰🇼 Kuwait' },
  { code: 'bh', name: '🇧🇭 Bahrain' },
  { code: 'om', name: '🇴🇲 Oman' },
  { code: 'pk', name: '🇵🇰 Pakistan' },
  { code: 'bd', name: '🇧🇩 Bangladesh' },
  { code: 'lk', name: '🇱🇰 Sri Lanka' },
  { code: 'mm', name: '🇲🇲 Myanmar' },
  { code: 'kh', name: '🇰🇭 Cambodia' },
  { code: 'la', name: '🇱🇦 Laos' },
  { code: 'mn', name: '🇲🇳 Mongolia' },
  { code: 'kz', name: '🇰🇿 Kazakhstan' },
  { code: 'uz', name: '🇺🇿 Uzbekistan' },
  { code: 'by', name: '🇧🇾 Belarus' },
  { code: 'lt', name: '🇱🇹 Lithuania' },
  { code: 'lv', name: '🇱🇻 Latvia' },
  { code: 'ee', name: '🇪🇪 Estonia' },
  { code: 'is', name: '🇮🇸 Iceland' },
  { code: 'lu', name: '🇱🇺 Luxembourg' },
  { code: 'mt', name: '🇲🇹 Malta' },
  { code: 'cy', name: '🇨🇾 Cyprus' },
  { code: 'al', name: '🇦🇱 Albania' },
  { code: 'mk', name: '🇲🇰 North Macedonia' },
  { code: 'me', name: '🇲🇪 Montenegro' },
  { code: 'ba', name: '🇧🇦 Bosnia and Herzegovina' },
  { code: 'si', name: '🇸🇮 Slovenia' },
  { code: 'sk', name: '🇸🇰 Slovakia' },
  { code: 'bg', name: '🇧🇬 Bulgaria' },
  { code: 'ge', name: '🇬🇪 Georgia' },
  { code: 'am', name: '🇦🇲 Armenia' },
  { code: 'az', name: '🇦🇿 Azerbaijan' },
  { code: 'tf', name: '🇹🇫 French Southern Territories' },
  { code: 'af', name: '🇦🇫 Afghanistan' },
  { code: 'am', name: '🇦🇲 Armenia' },
  { code: 'ao', name: '🇦🇴 Angola' },
  { code: 'ag', name: '🇦🇬 Antigua and Barbuda' },
  { code: 'bs', name: '🇧🇸 Bahamas' },
  { code: 'bb', name: '🇧🇧 Barbados' },
  { code: 'bj', name: '🇧🇯 Benin' },
  { code: 'bw', name: '🇧🇼 Botswana' },
  { code: 'bf', name: '🇧🇫 Burkina Faso' },
  { code: 'bi', name: '🇧🇮 Burundi' },
  { code: 'cv', name: '🇨🇻 Cape Verde' },
  { code: 'ky', name: '🇰🇾 Cayman Islands' },
  { code: 'cf', name: '🇨🇫 Central African Republic' },
  { code: 'td', name: '🇹🇩 Chad' },
  { code: 'km', name: '🇰🇲 Comoros' },
  { code: 'cg', name: '🇨🇬 Congo' },
  { code: 'cd', name: '🇨🇩 Congo (DRC)' },
  { code: 'dj', name: '🇩🇯 Djibouti' },
  { code: 'tz', name: '🇹🇿 Tanzania' },
  { code: 'gq', name: '🇬🇶 Equatorial Guinea' },
  { code: 'er', name: '🇪🇷 Eritrea' },
  { code: 'sz', name: '🇸🇿 Eswatini' },
  { code: 'fj', name: '🇫🇯 Fiji' },
  { code: 'ga', name: '🇬🇦 Gabon' },
  { code: 'gm', name: '🇬🇲 Gambia' },
  { code: 'gd', name: '🇬🇩 Grenada' },
  { code: 'gn', name: '🇬🇳 Guinea' },
  { code: 'gw', name: '🇬🇼 Guinea-Bissau' },
  { code: 'gy', name: '🇬🇾 Guyana' },
  { code: 'ht', name: '🇭🇹 Haiti' },
  { code: 'ie', name: '🇮🇪 Ireland' },
  { code: 'jm', name: '🇯🇲 Jamaica' },
  { code: 'ke', name: '🇰🇪 Kenya' },
  { code: 'ki', name: '🇰🇮 Kiribati' },
  { code: 'kr', name: '🇰🇷 South Korea' },
  { code: 'ls', name: '🇱🇸 Lesotho' },
  { code: 'lr', name: '🇱🇷 Liberia' },
  { code: 'ly', name: '🇱🇾 Libya' },
  { code: 'li', name: '🇱🇮 Liechtenstein' },
  { code: 'lt', name: '🇱🇹 Lithuania' },
  { code: 'mk', name: '🇲🇰 North Macedonia' },
  { code: 'mg', name: '🇲🇬 Madagascar' },
  { code: 'mw', name: '🇲🇼 Malawi' },
  { code: 'mv', name: '🇲🇻 Maldives' },
  { code: 'ml', name: '🇲🇱 Mali' },
  { code: 'mr', name: '🇲🇷 Mauritania' },
  { code: 'mu', name: '🇲🇺 Mauritius' },
  { code: 'fm', name: '🇫🇲 Micronesia' },
  { code: 'md', name: '🇲🇩 Moldova' },
  { code: 'mc', name: '🇲🇨 Monaco' },
  { code: 'mg', name: '🇲🇬 Madagascar' },
  { code: 'mz', name: '🇲🇿 Mozambique' },
  { code: 'na', name: '🇳🇦 Namibia' },
  { code: 'nr', name: '🇳🇷 Nauru' },
  { code: 'np', name: '🇳🇵 Nepal' },
  { code: 'ne', name: '🇳🇪 Niger' },
  { code: 'ng', name: '🇳🇬 Nigeria' },
  { code: 'om', name: '🇴🇲 Oman' },
  { code: 'pg', name: '🇵🇬 Papua New Guinea' },
  { code: 'ph', name: '🇵🇭 Philippines' },
  { code: 'qa', name: '🇶🇦 Qatar' },
  { code: 'rw', name: '🇷🇼 Rwanda' },
  { code: 'kn', name: '🇰🇳 Saint Kitts and Nevis' },
  { code: 'lc', name: '🇱🇨 Saint Lucia' },
  { code: 'vc', name: '🇻🇨 Saint Vincent and the Grenadines' },
  { code: 'ws', name: '🇼🇸 Samoa' },
  { code: 'sm', name: '🇸🇲 San Marino' },
  { code: 'st', name: '🇸🇹 Sao Tome and Principe' },
  { code: 'sn', name: '🇸🇳 Senegal' },
  { code: 'sc', name: '🇸🇨 Seychelles' },
  { code: 'sl', name: '🇸🇱 Sierra Leone' },
  { code: 'sb', name: '🇸🇧 Solomon Islands' },
  { code: 'so', name: '🇸🇴 Somalia' },
  { code: 'sd', name: '🇸🇩 Sudan' },
  { code: 'sr', name: '🇸🇷 Suriname' },
  { code: 'sy', name: '🇸🇾 Syria' },
  { code: 'tj', name: '🇹🇯 Tajikistan' },
  { code: 'tg', name: '🇹🇬 Togo' },
  { code: 'to', name: '🇹🇴 Tonga' },
  { code: 'tt', name: '🇹🇹 Trinidad and Tobago' },
  { code: 'tm', name: '🇹🇲 Turkmenistan' },
  { code: 'tv', name: '🇹🇻 Tuvalu' },
  { code: 'ug', name: '🇺🇬 Uganda' },
  { code: 'gb', name: '🇬🇧 United Kingdom' },
  { code: 'va', name: '🇻🇦 Vatican City' },
  { code: 'vi', name: '🇻🇮 US Virgin Islands' },
  { code: 'yz', name: '🇾🇪 Yemen' },
  { code: 'zm', name: '🇿🇲 Zambia' },
  { code: 'zw', name: '🇿🇼 Zimbabwe' },
]

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
  background:
    radial-gradient(ellipse at 20% 50%, rgba(0, 100, 200, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(220, 50, 50, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #0a1628 0%, #1a2940 50%, #0d1f35 100%);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

/* 装饰粒子：随机分布的小圆点 */
.login-view::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 50% 30%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 70% 70%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 20% 80%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 60% 10%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 80% 90%, rgba(255,255,255,0.2), transparent);
  pointer-events: none;
}

/* 装饰性背景：右下角半透明足球图案 */
.login-view::after {
  content: '⚽';
  position: absolute;
  bottom: -40px;
  right: -40px;
  font-size: 280px;
  opacity: 0.04;
  line-height: 1;
  pointer-events: none;
  transform: rotate(-15deg);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: var(--space-10) var(--space-8);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-light);
  position: relative;
  z-index: 1;
}

.login-title {
  text-align: center;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-2);
  color: var(--color-text-primary);
}

.login-desc {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
}

/* ========== 国家选择器样式 ========== */
.country-flag {
  font-size: var(--text-lg);
}

/* ========== 注册提示 ========== */
.register-notice {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: var(--space-3) 0 0;
  line-height: 1.5;
}

/* ========== el-select 自定义样式 ========== */
:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  padding: 4px 12px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: var(--radius-md);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-card {
  animation: fadeIn 0.3s ease-out;
}

@media (max-width: 768px) {
  .login-card {
    padding: var(--space-6) var(--space-5);
  }
}

@media (max-width: 480px) {
  .login-view {
    padding: var(--space-4);
    align-items: flex-start;
    padding-top: 20vh;
  }

  .login-card {
    padding: var(--space-5) var(--space-4);
    border-radius: var(--radius-lg);
  }

  .login-title {
    font-size: var(--text-xl);
  }

  .login-view::before {
    width: 200px;
    height: 200px;
    top: -60px;
    left: -60px;
  }

  .login-view::after {
    font-size: 160px;
    bottom: -20px;
    right: -20px;
  }
}
</style>
