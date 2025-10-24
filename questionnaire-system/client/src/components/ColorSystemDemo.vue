<template>
  <div class="color-demo-container">
    <h1>色系演示 - 基于 #25923457</h1>

    <!-- 主色系展示 -->
    <section class="demo-section">
      <h2>主色系</h2>
      <div class="color-grid">
        <div class="color-box" :style="{ backgroundColor: 'var(--color-primary-light-5)' }">
          <span>Primary Light 5</span>
          <code>#b3eabd</code>
        </div>
        <div class="color-box" :style="{ backgroundColor: 'var(--color-primary-light-4)' }">
          <span>Primary Light 4</span>
          <code>#8ddf98</code>
        </div>
        <div class="color-box" :style="{ backgroundColor: 'var(--color-primary-light-3)' }">
          <span>Primary Light 3</span>
          <code>#67d473</code>
        </div>
        <div class="color-box" :style="{ backgroundColor: 'var(--color-primary-light-2)' }">
          <span>Primary Light 2</span>
          <code>#51be5e</code>
        </div>
        <div class="color-box" :style="{ backgroundColor: 'var(--color-primary-light-1)' }">
          <span>Primary Light 1</span>
          <code>#3ba849</code>
        </div>
        <div class="color-box primary" :style="{ backgroundColor: 'var(--color-primary)' }">
          <span>Primary</span>
          <code>#259234</code>
        </div>
        <div class="color-box dark" :style="{ backgroundColor: 'var(--color-primary-dark-1)' }">
          <span>Primary Dark 1</span>
          <code>#1f7a2b</code>
        </div>
        <div class="color-box dark" :style="{ backgroundColor: 'var(--color-primary-dark-2)' }">
          <span>Primary Dark 2</span>
          <code>#196222</code>
        </div>
        <div class="color-box dark" :style="{ backgroundColor: 'var(--color-primary-dark-3)' }">
          <span>Primary Dark 3</span>
          <code>#134a19</code>
        </div>
        <div class="color-box dark" :style="{ backgroundColor: 'var(--color-primary-dark-4)' }">
          <span>Primary Dark 4</span>
          <code>#0d3211</code>
        </div>
      </div>
    </section>

    <!-- 功能色展示 -->
    <section class="demo-section">
      <h2>功能色</h2>
      <div class="color-grid">
        <div class="color-box" :style="{ backgroundColor: 'var(--color-success)' }">
          <span class="text-white">Success</span>
          <code class="text-white">{{ computedColors.success }}</code>
        </div>
        <div class="color-box" :style="{ backgroundColor: 'var(--color-warning)' }">
          <span class="text-white">Warning</span>
          <code class="text-white">{{ computedColors.warning }}</code>
        </div>
        <div class="color-box" :style="{ backgroundColor: 'var(--color-error)' }">
          <span class="text-white">Error</span>
          <code class="text-white">{{ computedColors.error }}</code>
        </div>
        <div class="color-box" :style="{ backgroundColor: 'var(--color-info)' }">
          <span class="text-white">Info</span>
          <code class="text-white">{{ computedColors.info }}</code>
        </div>
      </div>
    </section>

    <!-- 按钮示例 -->
    <section class="demo-section">
      <h2>按钮示例</h2>
      <div class="button-demo">
        <button class="btn btn-primary">主要按钮</button>
        <button class="btn btn-secondary">次要按钮</button>
        <button class="btn btn-text">文本按钮</button>
        <button class="btn btn-primary" disabled>禁用按钮</button>
      </div>
    </section>

    <!-- 卡片示例 -->
    <section class="demo-section">
      <h2>卡片示例</h2>
      <div class="cards-demo">
        <div class="card">
          <h3>普通卡片</h3>
          <p>这是一个使用默认样式的卡片组件</p>
        </div>
        <div class="card card-primary">
          <h3>主题卡片</h3>
          <p>这是一个使用主题色强调的卡片组件</p>
        </div>
      </div>
    </section>

    <!-- 输入框示例 -->
    <section class="demo-section">
      <h2>输入框示例</h2>
      <div class="input-demo">
        <input type="text" class="input" placeholder="请输入内容" v-model="inputValue" />
        <input type="text" class="input" placeholder="禁用状态" disabled />
      </div>
    </section>

    <!-- 徽章示例 -->
    <section class="demo-section">
      <h2>徽章示例</h2>
      <div class="badge-demo">
        <span class="badge badge-primary">Primary</span>
        <span class="badge badge-success">Success</span>
        <span class="badge badge-warning">Warning</span>
        <span class="badge badge-error">Error</span>
      </div>
    </section>

    <!-- 提示框示例 -->
    <section class="demo-section">
      <h2>提示框示例</h2>
      <div class="alert-demo">
        <div class="alert alert-success">✓ 操作成功！这是成功提示信息。</div>
        <div class="alert alert-warning">⚠ 警告信息！这是警告提示信息。</div>
        <div class="alert alert-error">✕ 错误信息！这是错误提示信息。</div>
        <div class="alert alert-info">ℹ 提示信息！这是普通提示信息。</div>
      </div>
    </section>

    <!-- 进度条示例 -->
    <section class="demo-section">
      <h2>进度条示例</h2>
      <div class="progress-demo">
        <div class="progress">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress" style="margin-top: 12px;">
          <div class="progress-bar progress-success" :style="{ width: '75%' }"></div>
        </div>
        <div class="progress" style="margin-top: 12px;">
          <div class="progress-bar progress-warning" :style="{ width: '50%' }"></div>
        </div>
        <div class="progress" style="margin-top: 12px;">
          <div class="progress-bar progress-error" :style="{ width: '25%' }"></div>
        </div>
      </div>
    </section>

    <!-- 标签页示例 -->
    <section class="demo-section">
      <h2>标签页示例</h2>
      <div class="tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'tab1' }"
          @click="activeTab = 'tab1'"
        >
          标签一
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'tab2' }"
          @click="activeTab = 'tab2'"
        >
          标签二
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'tab3' }"
          @click="activeTab = 'tab3'"
        >
          标签三
        </div>
      </div>
      <div class="tab-content">
        <p v-if="activeTab === 'tab1'">这是标签一的内容</p>
        <p v-if="activeTab === 'tab2'">这是标签二的内容</p>
        <p v-if="activeTab === 'tab3'">这是标签三的内容</p>
      </div>
    </section>

    <!-- CSS 变量使用说明 -->
    <section class="demo-section">
      <h2>在组件中使用 CSS 变量</h2>
      <div class="usage-example">
        <pre><code>&lt;template&gt;
  &lt;div class="my-component"&gt;
    &lt;button class="custom-button"&gt;自定义按钮&lt;/button&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;style scoped&gt;
.my-component {
  /* 使用主色 */
  background-color: var(--color-primary);
  
  /* 使用主色浅色 */
  border: 1px solid var(--color-primary-light-2);
  
  /* 使用阴影 */
  box-shadow: var(--shadow-md);
  
  /* 使用圆角 */
  border-radius: var(--radius-lg);
  
  /* 使用间距 */
  padding: var(--spacing-lg);
  
  /* 使用过渡 */
  transition: all var(--transition-base);
}

.custom-button {
  background: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-base);
}

.custom-button:hover {
  background: var(--color-primary-dark-1);
  box-shadow: var(--shadow-primary);
}
&lt;/style&gt;</code></pre>
      </div>
    </section>

    <!-- 可用的 CSS 变量列表 -->
    <section class="demo-section">
      <h2>可用的 CSS 变量</h2>
      <div class="variables-list">
        <h3>主色系</h3>
        <ul>
          <li><code>--color-primary</code></li>
          <li><code>--color-primary-light-1</code> 到 <code>--color-primary-light-5</code></li>
          <li><code>--color-primary-dark-1</code> 到 <code>--color-primary-dark-4</code></li>
        </ul>

        <h3>功能色</h3>
        <ul>
          <li><code>--color-success</code>, <code>--color-success-light</code>, <code>--color-success-dark</code></li>
          <li><code>--color-warning</code>, <code>--color-warning-light</code>, <code>--color-warning-dark</code></li>
          <li><code>--color-error</code>, <code>--color-error-light</code>, <code>--color-error-dark</code></li>
          <li><code>--color-info</code>, <code>--color-info-light</code>, <code>--color-info-dark</code></li>
        </ul>

        <h3>中性色</h3>
        <ul>
          <li><code>--color-gray-50</code> 到 <code>--color-gray-900</code></li>
        </ul>

        <h3>其他变量</h3>
        <ul>
          <li>阴影: <code>--shadow-sm</code>, <code>--shadow-base</code>, <code>--shadow-md</code>, <code>--shadow-lg</code>, <code>--shadow-xl</code></li>
          <li>圆角: <code>--radius-xs</code> 到 <code>--radius-full</code></li>
          <li>间距: <code>--spacing-xs</code> 到 <code>--spacing-3xl</code></li>
          <li>过渡: <code>--transition-fast</code>, <code>--transition-base</code>, <code>--transition-slow</code></li>
          <li>字体大小: <code>--font-size-xs</code> 到 <code>--font-size-4xl</code></li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

// 响应式数据
const inputValue = ref('');
const activeTab = ref('tab1');
const progress = ref(60);

// 计算后的颜色值
const computedColors = reactive({
  success: '#259234',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3'
});

// 动态进度条
onMounted(() => {
  let increasing = true;
  setInterval(() => {
    if (increasing) {
      progress.value += 1;
      if (progress.value >= 100) increasing = false;
    } else {
      progress.value -= 1;
      if (progress.value <= 0) increasing = true;
    }
  }, 50);
});
</script>

<style scoped>
.color-demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

h1 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-3xl);
}

.demo-section {
  margin-bottom: var(--spacing-2xl);
}

.demo-section h2 {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-light);
}

/* 颜色展示网格 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.color-box {
  padding: var(--spacing-lg);
  border-radius: var(--radius-base);
  text-align: center;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: var(--shadow-base);
  transition: transform var(--transition-base);
}

.color-box:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.color-box span {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.color-box code {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

.color-box.primary,
.color-box.dark {
  color: var(--text-inverse);
}

.text-white {
  color: var(--text-inverse) !important;
}

/* 按钮演示 */
.button-demo {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* 卡片演示 */
.cards-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.cards-demo h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.cards-demo p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 输入框演示 */
.input-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 400px;
}

/* 徽章演示 */
.badge-demo {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 提示框演示 */
.alert-demo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* 进度条演示 */
.progress-demo {
  max-width: 600px;
}

/* 标签页内容 */
.tab-content {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: 0 0 var(--radius-base) var(--radius-base);
}

/* 使用示例 */
.usage-example {
  background-color: var(--color-gray-900);
  color: var(--text-inverse);
  padding: var(--spacing-lg);
  border-radius: var(--radius-base);
  overflow-x: auto;
}

.usage-example pre {
  margin: 0;
}

.usage-example code {
  font-family: 'Courier New', Courier, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  white-space: pre;
}

/* 变量列表 */
.variables-list {
  background-color: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-base);
}

.variables-list h3 {
  color: var(--color-primary);
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
}

.variables-list h3:first-child {
  margin-top: 0;
}

.variables-list ul {
  list-style: none;
  padding-left: 0;
}

.variables-list li {
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
}

.variables-list code {
  background-color: var(--color-gray-800);
  color: var(--color-primary-light-3);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-sm);
}
</style>
