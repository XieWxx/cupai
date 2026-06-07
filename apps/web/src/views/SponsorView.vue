<template>
  <div class="sponsor-view">
    <h2 class="sponsor-title">{{ $t('sponsor.title') }}</h2>

    <!-- 赞助商区域 -->
    <section class="sponsor-section">
      <h3 class="section-heading">{{ $t('sponsor.partners') }}</h3>
      <div class="sponsor-grid">
        <!-- 金牌赞助商 -->
        <div
          v-for="i in 3"
          :key="'gold-' + i"
          class="sponsor-card sponsor-card--gold"
        >
          <div class="sponsor-placeholder">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" opacity="0.15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="sponsor-placeholder-text">{{ $t('sponsor.goldSponsor') }}</span>
          </div>
        </div>
        <!-- 银牌赞助商 -->
        <div
          v-for="i in 4"
          :key="'silver-' + i"
          class="sponsor-card sponsor-card--silver"
        >
          <div class="sponsor-placeholder">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" opacity="0.12"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="sponsor-placeholder-text">{{ $t('sponsor.silverSponsor') }}</span>
          </div>
        </div>
        <!-- 铜牌赞助商 -->
        <div
          v-for="i in 6"
          :key="'bronze-' + i"
          class="sponsor-card sponsor-card--bronze"
        >
          <div class="sponsor-placeholder">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" opacity="0.1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="sponsor-placeholder-text">{{ $t('sponsor.bronzeSponsor') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 赞助说明 -->
    <section class="sponsor-section">
      <h3 class="section-heading">{{ $t('sponsor.whySponsor') }}</h3>
      <div class="benefit-list">
        <div class="benefit-item" v-for="i in 4" :key="i">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path :d="benefitIcons[i - 1]"/></svg>
          </div>
          <div class="benefit-text">
            <h4>{{ $t(`sponsor.benefit${i}Title`) }}</h4>
            <p>{{ $t(`sponsor.benefit${i}Desc`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 收款码区域 -->
    <section class="sponsor-section sponsor-section--donate">
      <h3 class="section-heading">{{ $t('sponsor.donate') }}</h3>
      <p class="donate-desc">{{ $t('sponsor.donateDesc') }}</p>
      <div class="donate-grid">
        <!-- 微信收款码 -->
        <div class="donate-card">
          <div class="donate-qr-placeholder">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#07C160" opacity="0.3">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
            </svg>
            <span>{{ $t('sponsor.wechatPay') }}</span>
          </div>
          <p class="donate-label">{{ $t('sponsor.wechatPay') }}</p>
        </div>
        <!-- 支付宝收款码 -->
        <div class="donate-card">
          <div class="donate-qr-placeholder">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#1677FF" opacity="0.3">
              <path d="M21.422 15.358c-3.32-1.326-6.092-2.786-6.092-2.786s1.439-3.667.697-5.678c-.743-2.01-2.898-1.856-3.89-.89-.993.967-.782 3.098-.163 4.772.617 1.674 2.04 3.623 2.04 3.623s-2.272 4.284-4.39 6.715c-2.117 2.432-4.52 3.958-5.925 3.265-1.404-.694-.577-3.265.544-4.97 1.12-1.704 3.47-3.623 3.47-3.623l-.544-1.28s-3.858 2.38-5.655 5.078C-.628 22.682.09 24.87 1.79 24.87c1.7 0 4.965-2.047 7.23-5.078 2.267-3.032 4.118-6.327 4.118-6.327s2.928 1.393 5.7 2.624c2.773 1.231 5.163 2.01 5.163 2.01v-2.74z"/>
            </svg>
            <span>{{ $t('sponsor.alipay') }}</span>
          </div>
          <p class="donate-label">{{ $t('sponsor.alipay') }}</p>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="sponsor-section">
      <h3 class="section-heading">{{ $t('sponsor.contact') }}</h3>
      <p class="contact-desc">{{ $t('sponsor.contactDesc') }}</p>
      <el-button type="primary" size="large" @click="contactSponsor">
        {{ $t('sponsor.contactBtn') }}
      </el-button>
    </section>
  </div>
</template>

<script setup lang="ts">
// 赞助权益图标 SVG path
const benefitIcons = [
  // 全球曝光 - 地球
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  // 精准触达 - 目标
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  // 品牌合作 - 握手
  'M12.22 19.85c-.18.18-.5.21-.71 0L3.5 11.84c-.18-.18-.18-.5 0-.68l.71-.68c.18-.18.5-.18.71 0l6.14 6.14 8.14-8.14c.18-.18.5-.18.71 0l.68.68c.18.18.18.5 0 .71L12.22 19.85z',
  // 数据驱动 - 图表
  'M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z',
]

/** 联系赞助（占位） */
function contactSponsor() {
  // TODO: 跳转联系表单或邮件
  window.open('mailto:sponsor@cupai.ai', '_blank')
}
</script>

<style scoped>
.sponsor-view {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.sponsor-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: var(--space-8);
}

.sponsor-section {
  margin-bottom: var(--space-10);
}

.sponsor-section--donate {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.section-heading {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-border-light);
}

/* 赞助商网格 */
.sponsor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.sponsor-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sponsor-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.sponsor-card--gold {
  grid-column: span 1;
  min-height: 140px;
  border: 2px solid #FFD700;
  background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
}

.sponsor-card--silver {
  min-height: 110px;
  border: 2px solid #C0C0C0;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
}

.sponsor-card--bronze {
  min-height: 90px;
  border: 1px solid #CD7F32;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
}

.sponsor-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-2);
  color: var(--color-text-tertiary);
}

.sponsor-placeholder-text {
  font-size: var(--text-sm);
  opacity: 0.6;
}

/* 赞助权益 */
.benefit-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.benefit-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.benefit-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  color: var(--color-primary);
}

.benefit-text h4 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}

.benefit-text p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* 收款码 */
.donate-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-5);
}

.donate-grid {
  display: flex;
  justify-content: center;
  gap: var(--space-8);
}

.donate-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.donate-qr-placeholder {
  width: 180px;
  height: 220px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.donate-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  margin: 0;
}

/* 联系方式 */
.contact-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

/* 响应式 */
@media (max-width: 768px) {
  .sponsor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .sponsor-card--gold {
    grid-column: span 2;
  }
  .benefit-list {
    grid-template-columns: 1fr;
  }
  .donate-grid {
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
  }
}

@media (max-width: 480px) {
  .sponsor-grid {
    grid-template-columns: 1fr;
  }
  .sponsor-card--gold {
    grid-column: span 1;
  }
}
</style>
