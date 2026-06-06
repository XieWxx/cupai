<template>
  <!--
    复制指令弹窗（占位组件）
    用于在非安全上下文（HTTP / 不受信任域）中展示并手动复制 AI 指令文本，
    避免直接调用 navigator.clipboard 抛错。
    后续可补充：内容格式化、下载 .md、暗色主题适配等。
  -->
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="640px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdate"
  >
    <el-tabs v-if="hasMultipleTabs" v-model="activeKey">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :label="tab.label"
        :name="tab.key"
      />
    </el-tabs>

    <div v-else-if="firstTab" class="copy-dialog__single-label">
      {{ firstTab.label }}
    </div>

    <pre class="copy-dialog__content">{{ activeContent }}</pre>

    <template #footer>
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :disabled="!activeContent" @click="handleCopy">
        {{ $t('copyIntro.copyThisTab') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

// 国际化（必须在 setup 顶层调用）
const { t } = useI18n()

// 单个 tab 的数据结构（对外暴露，便于调用方复用类型）
export interface CopyInstructionTab {
  key: string
  label: string
  content: string
}

// 组件 props
const props = defineProps<{
  /** v-model 绑定的可见状态 */
  modelValue: boolean
  /** 弹窗标题 */
  title?: string
  /** 指令内容分页（支持多 tab 切换） */
  tabs?: CopyInstructionTab[]
}>()

// v-model 事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 派生：tab 数量
const hasMultipleTabs = computed(() => (props.tabs?.length ?? 0) > 1)

// 派生：第一个 tab（用于单 tab 模式下的 label 显示）
const firstTab = computed<CopyInstructionTab | undefined>(() => props.tabs?.[0])

// 当前激活的 tab key
const activeKey = ref<string>('')

// 当前展示内容（根据 activeKey 选中对应 tab.content）
const activeContent = computed(() => {
  if (!props.tabs || props.tabs.length === 0) return ''
  const found = props.tabs.find((tab) => tab.key === activeKey.value)
  return found ? found.content : props.tabs[0].content
})

// 当前激活 tab 的 label（用于复制成功提示）
const activeLabel = computed(() => {
  if (!props.tabs || props.tabs.length === 0) return ''
  const found = props.tabs.find((tab) => tab.key === activeKey.value)
  return found ? found.label : props.tabs[0].label
})

// 同步：tabs 变化时重置激活项为第一个
watch(
  () => props.tabs,
  (list) => {
    activeKey.value = list && list.length > 0 ? list[0].key : ''
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

// 复制按钮：clipboard API 优先，textarea+execCommand 兜底（兼容非安全上下文）
async function handleCopy() {
  const text = activeContent.value
  if (!text) return

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // 兜底方案：创建隐藏 textarea 手动执行 copy 命令
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      // execCommand 已弃用，但作为非安全上下文下的最后兜底仍可用
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success(t('copyIntro.copySuccess', { name: activeLabel.value }))
  } catch (err) {
    // 复制失败时给出提示，原始文本已在 <pre> 中可手动选择
    ElMessage.warning(t('copyIntro.copyFail'))
    // eslint-disable-next-line no-console
    console.error('[CopyInstructionDialog] copy failed:', err)
  }
}
</script>

<style scoped>
.copy-dialog__single-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
  font-weight: 500;
}

.copy-dialog__content {
  max-height: 360px;
  overflow: auto;
  padding: 12px 14px;
  margin: 0;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
}
</style>
