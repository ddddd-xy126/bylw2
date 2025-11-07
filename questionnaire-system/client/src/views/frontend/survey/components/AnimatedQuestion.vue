<template>
  <div class="animated-question-container" :class="[`question-type-${questionType}`, `animation-theme-${animationTheme}`]">
    <!-- 单选题动画 -->
    <div v-if="questionType === 'single'" class="single-choice-animation">
      <transition-group name="option-list" tag="div" class="options-wrapper">
        <div
          v-for="(option, index) in options"
          :key="option.id"
          :style="{ '--delay': index * 0.1 + 's' }"
          class="animated-option"
          :class="{
            'selected': isSelected(option.id),
            'hover-effect': true
          }"
          @click="handleSelect(option.id)"
        >
          <div class="option-content">
            <div class="option-radio">
              <transition name="check-scale">
                <div v-if="isSelected(option.id)" class="radio-checked">
                  <div class="radio-dot"></div>
                </div>
              </transition>
              <div class="radio-circle"></div>
            </div>
            <span class="option-text">{{ option.text || option.label }}</span>
          </div>
          
          <!-- 选中时的粒子效果 -->
          <transition name="particles">
            <div v-if="isSelected(option.id)" class="particle-effect">
              <span v-for="i in 6" :key="i" class="particle"></span>
            </div>
          </transition>
        </div>
      </transition-group>
    </div>

    <!-- 多选题动画 -->
    <div v-else-if="questionType === 'multiple'" class="multiple-choice-animation">
      <transition-group name="option-stagger" tag="div" class="options-wrapper">
        <div
          v-for="(option, index) in options"
          :key="option.id"
          :style="{ '--delay': index * 0.08 + 's' }"
          class="animated-option multiple"
          :class="{
            'selected': isSelected(option.id),
            'pulse-animation': isSelected(option.id)
          }"
          @click="handleMultipleSelect(option.id)"
        >
          <div class="option-content">
            <div class="option-checkbox">
              <transition name="check-bounce">
                <div v-if="isSelected(option.id)" class="checkbox-checked">
                  <svg viewBox="0 0 24 24" class="check-icon">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
              </transition>
              <div class="checkbox-border"></div>
            </div>
            <span class="option-text">{{ option.text || option.label }}</span>
          </div>
          
          <!-- 多选动画波纹 -->
          <div v-if="isSelected(option.id)" class="ripple-effect"></div>
        </div>
      </transition-group>
    </div>

    <!-- 评分题动画 -->
    <div v-else-if="questionType === 'rating'" class="rating-animation">
      <div class="rating-wrapper">
        <div class="stars-container">
          <div
            v-for="star in maxRating"
            :key="star"
            class="star-item"
            :class="{ 'active': star <= currentValue, 'bounce': star === currentValue }"
            @click="handleRatingClick(star)"
            @mouseenter="handleRatingHover(star)"
            @mouseleave="handleRatingLeave"
          >
            <svg viewBox="0 0 24 24" class="star-icon">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            
            <!-- 星星光晕效果 -->
            <div v-if="star <= currentValue" class="star-glow"></div>
          </div>
        </div>
        
        <!-- 评分文字提示 -->
        <transition name="fade-slide">
          <div v-if="currentValue > 0" class="rating-text">
            {{ ratingTexts[currentValue - 1] || `${currentValue} 分` }}
          </div>
        </transition>
      </div>
    </div>

    <!-- 文本题动画 -->
    <div v-else-if="questionType === 'text'" class="text-input-animation">
      <div class="text-wrapper">
        <textarea
          ref="textareaRef"
          v-model="textValue"
          :placeholder="placeholder || '请在此输入您的答案...'"
          :maxlength="maxLength || 500"
          :rows="rows || 4"
          class="animated-textarea"
          @focus="handleTextFocus"
          @blur="handleTextBlur"
          @input="handleTextInput"
        ></textarea>
        
        <!-- 输入计数器 -->
        <div class="text-counter" :class="{ 'show': isFocused || textValue }">
          <span class="current">{{ textValue?.length || 0 }}</span>
          <span class="separator">/</span>
          <span class="max">{{ maxLength || 500 }}</span>
        </div>
        
        <!-- 打字特效背景 -->
        <div class="typing-indicator" :class="{ 'active': isTyping }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  questionType: {
    type: String,
    required: true,
    validator: (value) => ['single', 'multiple', 'text', 'rating'].includes(value)
  },
  options: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: [String, Number, Array],
    default: null
  },
  maxRating: {
    type: Number,
    default: 5
  },
  ratingTexts: {
    type: Array,
    default: () => ['很差', '较差', '一般', '较好', '很好']
  },
  placeholder: String,
  maxLength: Number,
  rows: Number
});

const emit = defineEmits(['update:modelValue', 'change', 'commit']);

// 随机选择动画套装
const animationTheme = ref('default');
const animationThemes = ['default', 'bounce', 'slide', 'scale', 'rotate'];

onMounted(() => {
  // 随机选择一套动画
  animationTheme.value = animationThemes[Math.floor(Math.random() * animationThemes.length)];
});

// 单选/多选状态
const isSelected = (optionId) => {
  if (props.questionType === 'multiple') {
    return Array.isArray(props.modelValue) && props.modelValue.includes(optionId);
  }
  return props.modelValue === optionId;
};

const handleSelect = (optionId) => {
  emit('update:modelValue', optionId);
  emit('change', optionId);
  
  // 触发选中动画音效（可选）
  playSelectSound();
};

const handleMultipleSelect = (optionId) => {
  let newValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  
  if (newValue.includes(optionId)) {
    newValue = newValue.filter(id => id !== optionId);
  } else {
    newValue.push(optionId);
  }
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
  
  playSelectSound();
};

// 评分状态
const currentValue = ref(props.modelValue || 0);
const hoverValue = ref(0);

watch(() => props.modelValue, (newVal) => {
  currentValue.value = newVal || 0;
});

const handleRatingClick = (star) => {
  currentValue.value = star;
  emit('update:modelValue', star);
  emit('change', star);
  
  // 触发星星动画音效
  playStarSound();
};

const handleRatingHover = (star) => {
  hoverValue.value = star;
};

const handleRatingLeave = () => {
  hoverValue.value = 0;
};

// 文本输入状态
const textValue = ref(props.modelValue || '');
const isFocused = ref(false);
const isTyping = ref(false);
const textareaRef = ref(null);
let typingTimer = null;

watch(() => props.modelValue, (newVal) => {
  textValue.value = newVal || '';
});

const handleTextFocus = () => {
  isFocused.value = true;
};

const handleTextBlur = () => {
  isFocused.value = false;
  emit('update:modelValue', textValue.value);
  emit('commit', textValue.value);
};

const handleTextInput = () => {
  isTyping.value = true;
  
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isTyping.value = false;
  }, 500);
  
  emit('update:modelValue', textValue.value);
};

// 音效播放（可选）
const playSelectSound = () => {
  // 可以添加音效播放逻辑
  // const audio = new Audio('/sounds/click.mp3');
  // audio.volume = 0.3;
  // audio.play().catch(() => {});
};

const playStarSound = () => {
  // const audio = new Audio('/sounds/star.mp3');
  // audio.volume = 0.4;
  // audio.play().catch(() => {});
};
</script>

<style scoped lang="scss">
.animated-question-container {
  width: 100%;
  padding: 8px 0;
}

/* ==================== 单选题动画 ==================== */
.single-choice-animation {
  .options-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .animated-option {
    position: relative;
    padding: 18px 20px;
    border: 2px solid #e4e7ed;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideInLeft 0.5s ease-out backwards;
    animation-delay: var(--delay);

    &:hover {
      border-color: var(--color-primary-light-3);
      background: linear-gradient(135deg, #f0f9ff 0%, #e1f3ff 100%);
      transform: translateX(8px) scale(1.02);
      box-shadow: 0 8px 16px rgba(64, 158, 255, 0.15);
    }

    &.selected {
      border-color: var(--color-primary);
      background: linear-gradient(135deg, #e1f3ff 0%, #d0edff 100%);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
      animation: selectBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .option-radio {
      position: relative;
      width: 24px;
      height: 24px;
      flex-shrink: 0;

      .radio-circle {
        width: 100%;
        height: 100%;
        border: 2px solid #dcdfe6;
        border-radius: 50%;
        transition: all 0.3s ease;
      }

      .radio-checked {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        border: 2px solid var(--color-primary);
        border-radius: 50%;
        background: var(--color-primary);
        
        .radio-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          animation: dotPulse 0.6s ease-out;
        }
      }
    }

    &.selected .radio-circle {
      border-color: var(--color-primary);
    }

    .option-text {
      font-size: 16px;
      color: #303133;
      line-height: 1.5;
      flex: 1;
      transition: color 0.3s ease;
    }

    &.selected .option-text {
      color: var(--color-primary);
      font-weight: 500;
    }

    .particle-effect {
      position: absolute;
      top: 50%;
      left: 20px;
      pointer-events: none;

      .particle {
        position: absolute;
        width: 6px;
        height: 6px;
        background: var(--color-primary-light-3);
        border-radius: 50%;
        animation: particleBurst 0.8s ease-out forwards;

        @for $i from 1 through 6 {
          &:nth-child(#{$i}) {
            --angle: #{$i * 60}deg;
            animation-delay: #{$i * 0.05}s;
          }
        }
      }
    }
  }
}

/* ==================== 多选题动画 ==================== */
.multiple-choice-animation {
  .options-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .animated-option {
    position: relative;
    animation: fadeInUp 0.5s ease-out backwards;
    animation-delay: var(--delay);
    margin-bottom: 0;

    &.selected {
      animation: checkBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .option-checkbox {
      position: relative;
      width: 24px;
      height: 24px;
      flex-shrink: 0;

      .checkbox-border {
        width: 100%;
        height: 100%;
        border: 2px solid #dcdfe6;
        border-radius: 6px;
        transition: all 0.3s ease;
      }

      .checkbox-checked {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--color-primary);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;

        .check-icon {
          width: 16px;
          height: 16px;
          fill: white;
          animation: checkDraw 0.4s ease-out;
        }
      }
    }

    .option-text {
      flex: 1;
      line-height: 1.5;
    }

    &.selected .checkbox-border {
      border-color: var(--color-primary);
    }

    .ripple-effect {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 12px;
      background: var(--color-primary);
      opacity: 0;
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    }
  }

  .pulse-animation {
    animation: pulse 0.6s ease-out;
  }
}

/* ==================== 评分题动画 ==================== */
.rating-animation {
  .rating-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
  }

  .stars-container {
    display: flex;
    gap: 24px;
    justify-content: center;
    padding: 10px 0;
  }

  .star-item {
    position: relative;
    width: 50px;
    height: 50px;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    &:hover {
      transform: scale(1.15) rotate(8deg);
    }

    &.active {
      animation: starBounce 0.6s ease-out;

      .star-icon {
        fill: #ffd700;
        filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.5));
      }
    }

    &.bounce {
      animation: starPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .star-icon {
      width: 100%;
      height: 100%;
      fill: #e4e7ed;
      transition: all 0.3s ease;
    }

    .star-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 55px;
      height: 55px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.4), transparent 70%);
      border-radius: 50%;
      animation: glowPulse 1.5s ease-in-out infinite;
      pointer-events: none;
      z-index: -1;
    }
  }

  .rating-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
    text-align: center;
    padding: 8px 20px;
    background: linear-gradient(135deg, #f0f9ff, #e1f3ff);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  }
}

/* ==================== 文本题动画 ==================== */
.text-input-animation {
  .text-wrapper {
    position: relative;
  }

  .animated-textarea {
    width: 100%;
    padding: 16px;
    border: 2px solid #e4e7ed;
    border-radius: 12px;
    font-size: 15px;
    line-height: 1.6;
    color: #303133;
    background: white;
    resize: vertical;
    transition: all 0.3s ease;
    animation: fadeIn 0.5s ease-out;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      background: linear-gradient(135deg, #ffffff, #f8fcff);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      animation: inputGlow 0.6s ease-out;
    }

    &::placeholder {
      color: #c0c4cc;
    }
  }

  .text-counter {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 12px;
    color: #909399;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;

    &.show {
      opacity: 1;
      transform: translateY(0);
    }

    .current {
      color: var(--color-primary);
      font-weight: 600;
    }

    .separator {
      margin: 0 4px;
    }
  }

  .typing-indicator {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;

    &.active {
      opacity: 1;

      span {
        width: 6px;
        height: 6px;
        background: var(--color-primary);
        border-radius: 50%;
        animation: typingDot 1.4s ease-in-out infinite;

        @for $i from 1 through 3 {
          &:nth-child(#{$i}) {
            animation-delay: #{($i - 1) * 0.2}s;
          }
        }
      }
    }
  }
}

/* ==================== 动画关键帧 ==================== */

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes selectBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes checkBounce {
  0%, 100% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.08);
  }
  50% {
    transform: scale(0.95);
  }
  70% {
    transform: scale(1.02);
  }
}

@keyframes dotPulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes particleBurst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(cos(var(--angle)) * 40px),
      calc(sin(var(--angle)) * 40px)
    ) scale(0);
    opacity: 0;
  }
}

@keyframes checkDraw {
  0% {
    transform: scale(0) rotate(-45deg);
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes ripple {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
}

@keyframes starBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

@keyframes starPop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.4) rotate(15deg);
  }
  50% {
    transform: scale(1.2) rotate(-10deg);
  }
  70% {
    transform: scale(1.3) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes inputGlow {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }
  50% {
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
  }
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* ==================== 过渡动画 ==================== */

.option-list-enter-active {
  animation: slideInLeft 0.5s ease-out;
}

.option-list-leave-active {
  animation: slideInLeft 0.3s ease-out reverse;
}

.option-stagger-enter-active {
  animation: fadeInUp 0.5s ease-out;
}

.option-stagger-leave-active {
  animation: fadeInUp 0.3s ease-out reverse;
}

.check-scale-enter-active {
  animation: dotPulse 0.4s ease-out;
}

.check-bounce-enter-active {
  animation: checkDraw 0.4s ease-out;
}

.particles-enter-active {
  animation: fadeIn 0.3s ease-out;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ==================== 多套动画主题 ==================== */

/* 主题1: 默认弹跳 */
.animation-theme-default {
  .animated-option {
    animation: slideInLeft 0.5s ease-out backwards;
    animation-delay: var(--delay);
    
    &.selected {
      animation: selectBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  }
  
  .multiple-option {
    animation: fadeInUp 0.5s ease-out backwards;
    animation-delay: var(--delay);
    
    &.selected {
      animation: checkBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  }
}

/* 主题2: 缩放进入 */
.animation-theme-scale {
  .animated-option,
  .multiple-option {
    animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    animation-delay: var(--delay);
    
    &.selected {
      animation: scalePopBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-5deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes scalePopBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15) rotate(3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 主题3: 滑动翻转 */
.animation-theme-slide {
  .animated-option,
  .multiple-option {
    animation: slideFlipIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
    animation-delay: var(--delay);
    
    &.selected {
      animation: slideFlipBounce 0.5s ease-out;
    }
  }
}

@keyframes slideFlipIn {
  from {
    opacity: 0;
    transform: translateX(-100px) rotateY(-90deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotateY(0deg);
  }
}

@keyframes slideFlipBounce {
  0%, 100% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(15deg) scale(1.05);
  }
}

/* 主题4: 回弹 */
.animation-theme-bounce {
  .animated-option,
  .multiple-option {
    animation: bounceInDown 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
    animation-delay: var(--delay);
    
    &.selected {
      animation: elasticBounce 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  }
}

@keyframes bounceInDown {
  from {
    opacity: 0;
    transform: translateY(-100px) scale(0.8);
  }
  60% {
    opacity: 1;
    transform: translateY(20px) scale(1.05);
  }
  80% {
    transform: translateY(-10px) scale(0.98);
  }
  to {
    transform: translateY(0) scale(1);
  }
}

@keyframes elasticBounce {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.2) rotate(-5deg);
  }
  50% {
    transform: scale(0.9) rotate(5deg);
  }
  70% {
    transform: scale(1.05) rotate(-2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 主题5: 旋转缩放 */
.animation-theme-rotate {
  .animated-option,
  .multiple-option {
    animation: rotateScaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    animation-delay: var(--delay);
    
    &.selected {
      animation: rotatePop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  }
}

@keyframes rotateScaleIn {
  from {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.1) rotate(-90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes rotatePop {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.15) rotate(10deg);
  }
  50% {
    transform: scale(1.1) rotate(-10deg);
  }
  75% {
    transform: scale(1.05) rotate(5deg);
  }
}

/* 增强选中效果 - 所有主题通用 */
.animated-option.selected,
.multiple-option.selected {
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.25) !important;
  border-color: var(--color-primary) !important;
  
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border: 2px solid var(--color-primary);
    border-radius: 14px;
    opacity: 0.3;
    animation: pulseRing 1.5s ease-out infinite;
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.05);
    opacity: 0;
  }
}

</style>
