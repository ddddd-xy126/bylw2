<template>
  <div class="dynamic-progress">
    <!-- 圆形进度条 -->
    <div v-if="type === 'circle'" class="circle-container">
      <svg viewBox="0 0 200 200" class="circle-svg">
        <defs>
          <linearGradient id="circle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#667eea" />
            <stop offset="50%" stop-color="#764ba2" />
            <stop offset="100%" stop-color="#f093fb" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- 背景圆环 -->
        <circle cx="100" cy="100" r="80" fill="none" stroke="#e8e8e8" stroke-width="8" opacity="0.3" />
        <!-- 进度圆环 -->
        <circle
          class="circle-progress"
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#circle-gradient)"
          stroke-width="10"
          stroke-linecap="round"
          filter="url(#glow)"
          :style="{ strokeDashoffset: circleOffset }"
        />
        <!-- 百分比文字 -->
        <text x="100" y="105" text-anchor="middle" class="circle-text">{{ percent }}%</text>
        <text x="100" y="125" text-anchor="middle" class="circle-label">完成度</text>
      </svg>
    </div>

    <!-- 液体填充 -->
    <div v-else-if="type === 'liquid'" class="liquid-container">
      <svg viewBox="0 0 200 200" class="liquid-svg">
        <defs>
          <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4fc3f7" />
            <stop offset="100%" stop-color="#0288d1" />
          </linearGradient>
          <clipPath id="bottle-clip">
            <path d="M70 20 L130 20 L130 180 Q115 195 100 195 Q85 195 70 180 Z" />
          </clipPath>
        </defs>
        <!-- 瓶子轮廓 -->
        <path 
          d="M70 20 L130 20 L130 180 Q115 195 100 195 Q85 195 70 180 Z" 
          fill="none" 
          stroke="#90caf9" 
          stroke-width="3"
          opacity="0.5"
        />
        <!-- 液体 -->
        <g clip-path="url(#bottle-clip)">
          <rect 
            x="70" 
            :y="liquidY" 
            width="60" 
            :height="liquidHeight" 
            fill="url(#liquid-gradient)"
            class="liquid-fill"
          />
          <!-- 波浪效果 -->
          <path 
            :d="wavePath" 
            fill="rgba(255, 255, 255, 0.3)"
            class="liquid-wave"
          />
        </g>
        <!-- 百分比 -->
        <text x="100" y="110" text-anchor="middle" class="liquid-text">{{ percent }}%</text>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'circle' }, // 'circle' | 'liquid'
  percent: { type: Number, default: 50 } // 0~100
})

const wavePath = ref('')

// 圆形进度条的偏移量计算
const circleOffset = computed(() => {
  const circumference = 2 * Math.PI * 80
  return circumference - (props.percent / 100) * circumference
})

// 液体高度和位置
const liquidHeight = computed(() => {
  return (props.percent / 100) * 175
})

const liquidY = computed(() => {
  return 195 - liquidHeight.value
})

// 波浪路径生成（液体填充）
function generateWavePath(percent) {
  const baseY = 195 - (percent / 100) * 175
  const waveHeight = 5
  let path = `M70 ${baseY}`
  
  for (let x = 70; x <= 130; x += 2) {
    const relativeX = (x - 70) / 60
    const y = baseY + Math.sin(relativeX * Math.PI * 4 + Date.now() / 500) * waveHeight
    path += ` L${x} ${y}`
  }
  
  path += ` L130 ${baseY} L70 ${baseY} Z`
  return path
}

// 监听 percent 改变时更新波浪
watch(
  () => props.percent,
  (val) => {
    wavePath.value = generateWavePath(val)
  },
  { immediate: true }
)

// 动画更新波浪
let waveAnimationId = null
const updateWave = () => {
  wavePath.value = generateWavePath(props.percent)
  waveAnimationId = requestAnimationFrame(updateWave)
}

// 开始波浪动画
if (props.type === 'liquid') {
  updateWave()
}

// 清理动画
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  if (waveAnimationId) {
    cancelAnimationFrame(waveAnimationId)
  }
})
</script>

<style scoped lang="scss">
.dynamic-progress {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  /* 圆形进度条 */
  .circle-container {
    width: 200px;
    height: 200px;

    @media (max-width: 768px) {
      width: 150px;
      height: 150px;
    }

    .circle-svg {
      width: 100%;
      height: 100%;
    }

    .circle-progress {
      stroke-dasharray: 502.65;
      transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
      transform: rotate(-90deg);
      transform-origin: center;
    }

    .circle-text {
      font-size: 36px;
      font-weight: 700;
      fill: #667eea;
      transition: all 0.3s ease;

      @media (max-width: 768px) {
        font-size: 28px;
      }
    }

    .circle-label {
      font-size: 14px;
      fill: #999;
      font-weight: 500;
    }
  }

  /* 💧 液体填充 */
  .liquid-container {
    width: 200px;
    height: 200px;

    @media (max-width: 768px) {
      width: 150px;
      height: 150px;
    }

    .liquid-svg {
      width: 100%;
      height: 100%;
    }

    .liquid-fill {
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .liquid-wave {
      animation: wave-move 2s ease-in-out infinite;
    }

    .liquid-text {
      font-size: 28px;
      font-weight: 700;
      fill: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 768px) {
        font-size: 22px;
      }
    }
  }
}

@keyframes wave-move {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}
</style>
