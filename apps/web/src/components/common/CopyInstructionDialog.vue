<template>
  <!--
    AI 分析指引弹窗
    点击"分析"按钮后弹出，自动复制指令到剪贴板，
    并展示 3 步操作引导流程。
  -->
  <el-dialog
    :model-value="modelValue"
    :title="title || t('copyIntro.dialogTitle')"
    width="520px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdate"
  >
    <!-- 步骤引导 -->
    <div class="analysis-guide">
      <!-- 步骤 1：复制分析指令 -->
      <div class="analysis-guide__step" :class="{ 'analysis-guide__step--done': autoCopySuccess }">
        <div class="analysis-guide__step-number">
          <el-icon v-if="autoCopySuccess" :size="20" color="var(--el-color-success)"><CircleCheckFilled /></el-icon>
          <span v-else>1</span>
        </div>
        <div class="analysis-guide__step-content">
          <div class="analysis-guide__step-title">{{ t('copyIntro.step1Title') }}</div>
          <div class="analysis-guide__step-desc">{{ t('copyIntro.step1Desc') }}</div>
          <div v-if="autoCopySuccess" class="analysis-guide__step-badge analysis-guide__step-badge--success">
            <el-icon :size="12"><CircleCheckFilled /></el-icon>
            {{ t('copyIntro.autoCopied') }}
          </div>
          <div v-else class="analysis-guide__step-badge analysis-guide__step-badge--warning">
            <el-icon :size="12"><WarningFilled /></el-icon>
            {{ t('copyIntro.autoCopyFail') }}
          </div>
        </div>
      </div>

      <!-- 步骤连接线 -->
      <div class="analysis-guide__connector" />

      <!-- 步骤 2：粘贴到 Agent -->
      <div class="analysis-guide__step">
        <div class="analysis-guide__step-number">2</div>
        <div class="analysis-guide__step-content">
          <div class="analysis-guide__step-title">{{ t('copyIntro.step2Title') }}</div>
          <div class="analysis-guide__step-desc">{{ t('copyIntro.step2Desc') }}</div>
        </div>
      </div>

      <!-- 步骤连接线 -->
      <div class="analysis-guide__connector" />

      <!-- 步骤 3：等待分析回传 -->
      <div class="analysis-guide__step">
        <div class="analysis-guide__step-number">3</div>
        <div class="analysis-guide__step-content">
          <div class="analysis-guide__step-title">{{ t('copyIntro.step3Title') }}</div>
          <div class="analysis-guide__step-desc">{{ t('copyIntro.step3Desc') }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">{{ t('common.close') }}</el-button>
      <el-button type="primary" @click="handleManualCopy">
        {{ t('copyIntro.copyThisTab') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'

const { t } = useI18n()

// 组件 props
const props = defineProps<{
  /** v-model 绑定的可见状态 */
  modelValue: boolean
  /** 弹窗标题 */
  title?: string
  /** 指令文本内容（用于复制到剪贴板） */
  instructionText?: string
  /** 自动复制是否成功（由父组件传入） */
  autoCopied?: boolean
}>()

// v-model 事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 自动复制结果
const autoCopySuccess = ref(false)

// 监听弹窗打开，同步自动复制状态
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      autoCopySuccess.value = props.autoCopied ?? false
    }
  },
  { immediate: true },
)

// 关闭弹窗
function handleClose() {
  emit('update:modelValue', false)
}

// v-model 透传更新
function handleUpdate(value: boolean) {
  emit('update:modelValue', value)
}

// 手动复制按钮
async function handleManualCopy() {
  const text = props.instructionText
  if (!text) return

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    autoCopySuccess.value = true
    ElMessage.success(t('copyIntro.autoCopied'))
  } catch (err) {
    ElMessage.warning(t('copyIntro.copyFail'))
    console.error('[AnalysisGuideDialog] copy failed:', err)
  }
}
</script>

<style scoped>
.analysis-guide {
  padding: 8px 0;
}

.analysis-guide__step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.analysis-guide__step--done {
  /* 完成状态 */
}

.analysis-guide__step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.analysis-guide__step--done .analysis-guide__step-number {
  background: var(--el-color-success-light-3);
}

.analysis-guide__step-content {
  flex: 1;
  padding-top: 4px;
}

.analysis-guide__step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.analysis-guide__step-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.analysis-guide__step-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.analysis-guide__step-badge--success {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.analysis-guide__step-badge--warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
}

.analysis-guide__connector {
  width: 2px;
  height: 20px;
  margin-left: 15px;
  background: var(--el-border-color-light);
}
</style>
