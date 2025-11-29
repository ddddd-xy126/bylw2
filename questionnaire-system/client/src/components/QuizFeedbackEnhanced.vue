<template>
  <transition name="feedback-modal">
    <div
      v-if="visible"
      class="quiz-feedback-overlay"
      @click="handleOverlayClick"
    >
      <div class="quiz-feedback-container" :class="feedbackType">
        <!-- 正确答案动画 -->
        <div v-if="feedbackType === 'correct'" class="feedback-correct">
          <!-- 背景粒子效果 -->
          <div class="particles">
            <div
              v-for="i in 20"
              :key="`particle-${i}`"
              class="particle"
              :style="getParticleStyle(i)"
            ></div>
          </div>

          <!-- 光环效果 -->
          <div class="glow-rings">
            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
          </div>

          <!-- 主图标 - 奖杯动画 -->
          <div class="main-icon">
            <div class="trophy-container">
              <div class="trophy">
                <div class="trophy-top">
                  <div class="trophy-handle left"></div>
                  <div class="trophy-cup">
                    <div class="trophy-shine"></div>
                  </div>
                  <div class="trophy-handle right"></div>
                </div>
                <div class="trophy-base"></div>
              </div>
              <!-- 星星装饰 -->
              <div class="stars">
                <div
                  v-for="i in 5"
                  :key="`star-${i}`"
                  class="star"
                  :style="getStarStyle(i)"
                >
                  ★
                </div>
              </div>
            </div>
          </div>

          <!-- 烟花效果 -->
          <div class="fireworks">
            <div
              v-for="i in 3"
              :key="`firework-${i}`"
              class="firework"
              :style="{ left: `${20 + i * 30}%` }"
            >
              <div
                v-for="j in 8"
                :key="`spark-${j}`"
                class="spark"
                :style="{ transform: `rotate(${j * 45}deg)` }"
              ></div>
            </div>
          </div>

          <!-- 文字内容 -->
          <div class="feedback-content">
            <h2 class="feedback-title bounce-in">
              <span class="emoji">🎉</span>
              太棒了！
              <span class="emoji">🎊</span>
            </h2>
            <p class="feedback-subtitle slide-up">回答正确</p>
          </div>
        </div>

        <!-- 错误答案动画 -->
        <div v-else class="feedback-incorrect">
          <!-- 背景波纹 -->
          <div class="ripple-container">
            <div
              v-for="i in 3"
              :key="`ripple-${i}`"
              class="ripple"
              :style="{ animationDelay: `${i * 0.15}s` }"
            ></div>
          </div>

          <!-- 主图标 - 思考动画 -->
          <div class="main-icon">
            <div class="thinking-face">
              <div class="face-bg"></div>
              <div class="eyes">
                <div class="eye left">
                  <div class="pupil"></div>
                </div>
                <div class="eye right">
                  <div class="pupil"></div>
                </div>
              </div>
              <div class="mouth">
                <div class="mouth-curve"></div>
              </div>
              <!-- 思考气泡 -->
              <div class="thought-bubbles">
                <div class="bubble bubble-1">?</div>
                <div class="bubble bubble-2">?</div>
                <div class="bubble bubble-3">?</div>
              </div>
            </div>
          </div>

          <!-- 漂浮的问号 -->
          <div class="floating-marks">
            <div
              v-for="i in 6"
              :key="`mark-${i}`"
              class="question-mark"
              :style="getQuestionMarkStyle(i)"
            >
              ?
            </div>
          </div>

          <!-- 文字内容 -->
          <div class="feedback-content">
            <h2 class="feedback-title shake-in">
              <span class="emoji">🤔</span>
              再想想哦
            </h2>
            <p class="feedback-subtitle fade-in">别灰心，继续加油！</p>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="auto-close-bar">
          <div class="progress-bar"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { watch } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  feedbackType: {
    type: String,
    default: "correct", // 'correct' | 'incorrect'
  },
});

const emit = defineEmits(["finish"]);

// 生成粒子样式
const getParticleStyle = (index) => {
  const colors = [
    "#FFD700",
    "#FFA500",
    "#FF69B4",
    "#87CEEB",
    "#98FB98",
    "#DDA0DD",
  ];
  const angle = (360 / 20) * index;
  const distance = 100 + Math.random() * 50;
  const duration = 1 + Math.random() * 0.5;

  return {
    "--angle": `${angle}deg`,
    "--distance": `${distance}px`,
    "--color": colors[index % colors.length],
    animationDuration: `${duration}s`,
    animationDelay: `${Math.random() * 0.3}s`,
  };
};

// 生成星星样式
const getStarStyle = (index) => {
  const positions = [
    { top: "10%", left: "15%" },
    { top: "20%", right: "20%" },
    { top: "60%", left: "10%" },
    { top: "70%", right: "15%" },
    { top: "40%", right: "10%" },
  ];

  return {
    ...positions[index - 1],
    animationDelay: `${0.3 + index * 0.1}s`,
  };
};

// 生成问号样式
const getQuestionMarkStyle = (index) => {
  const positions = [
    { top: "15%", left: "20%" },
    { top: "25%", right: "25%" },
    { top: "65%", left: "15%" },
    { top: "75%", right: "20%" },
    { top: "45%", left: "10%" },
    { top: "55%", right: "15%" },
  ];

  return {
    ...positions[index - 1],
    animationDelay: `${index * 0.15}s`,
  };
};

// 点击背景关闭（可选）
const handleOverlayClick = (e) => {
  if (e.target.classList.contains("quiz-feedback-overlay")) {
    // 可以选择是否允许点击背景关闭
    // emit('finish');
  }
};

// 自动关闭
watch(
  () => props.visible,
  (val) => {
    if (val) {
      setTimeout(() => {
        emit("finish");
      }, 2000); // 2秒后自动关闭
    }
  }
);
</script>

<style scoped>
/* ==================== 基础布局 ==================== */
.quiz-feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9999;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  pointer-events: none;
}

.quiz-feedback-overlay > * {
  pointer-events: auto;
}

.quiz-feedback-container {
  position: relative;
  width: 320px;
  height: 360px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  transform-origin: center;
}

.quiz-feedback-container.correct {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.quiz-feedback-container.incorrect {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.feedback-correct,
.feedback-incorrect {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* ==================== 正确答案动画 ==================== */

/* 粒子效果 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--color);
  border-radius: 50%;
  animation: particle-burst 1.2s ease-out forwards;
}

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle))
      translateY(var(--distance)) scale(1);
    opacity: 0;
  }
}

/* 光环效果 */
.glow-rings {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: ring-pulse 1.5s ease-out infinite;
}

.ring-1 {
  width: 200px;
  height: 200px;
  animation-delay: 0s;
}

.ring-2 {
  width: 250px;
  height: 250px;
  animation-delay: 0.3s;
}

.ring-3 {
  width: 300px;
  height: 300px;
  animation-delay: 0.6s;
}

@keyframes ring-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

/* 奖杯动画 */
.trophy-container {
  position: relative;
  animation: trophy-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes trophy-pop {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.trophy {
  width: 80px;
  height: 95px;
  position: relative;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.trophy-top {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
}

.trophy-handle {
  width: 10px;
  height: 28px;
  background: linear-gradient(180deg, #ffd700 0%, #ffa500 100%);
  border-radius: 6px;
  position: relative;
}

.trophy-handle.left {
  transform: rotate(-20deg);
  margin-right: -8px;
}

.trophy-handle.right {
  transform: rotate(20deg);
  margin-left: -8px;
}

.trophy-cup {
  width: 55px;
  height: 60px;
  background: linear-gradient(180deg, #ffd700 0%, #ffa500 100%);
  border-radius: 0 0 28px 28px;
  position: relative;
  overflow: hidden;
  animation: trophy-shine 2s ease-in-out infinite;
}

.trophy-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 70%
  );
  animation: shine-move 3s ease-in-out infinite;
}

@keyframes shine-move {
  0%,
  100% {
    transform: translateX(-100%) translateY(-100%);
  }
  50% {
    transform: translateX(100%) translateY(100%);
  }
}

.trophy-base {
  width: 70px;
  height: 20px;
  background: linear-gradient(180deg, #daa520 0%, #b8860b 100%);
  border-radius: 6px;
  margin-top: 3px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

/* 星星 */
.stars .star {
  position: absolute;
  font-size: 16px;
  color: #ffd700;
  animation: star-twinkle 1s ease-in-out infinite;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
}

@keyframes star-twinkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.3) rotate(180deg);
    opacity: 0.6;
  }
}

/* 烟花 */
.fireworks {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.firework {
  position: absolute;
  top: 20%;
}

.spark {
  position: absolute;
  width: 3px;
  height: 20px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 1),
    rgba(255, 215, 0, 0)
  );
  transform-origin: bottom center;
  animation: spark-shoot 0.8s ease-out forwards;
}

@keyframes spark-shoot {
  0% {
    transform: rotate(var(--rotation)) translateY(0) scaleY(0);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--rotation)) translateY(-50px) scaleY(1);
    opacity: 0;
  }
}

/* ==================== 错误答案动画 ==================== */

/* 波纹效果 */
.ripple-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: ripple-expand 2s ease-out infinite;
}

@keyframes ripple-expand {
  0% {
    width: 100px;
    height: 100px;
    opacity: 1;
  }
  100% {
    width: 400px;
    height: 400px;
    opacity: 0;
  }
}

/* 思考表情 */
.thinking-face {
  position: relative;
  width: 100px;
  height: 100px;
  animation: face-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes face-pop {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

.face-bg {
  width: 100px;
  height: 100px;
  background: #ffe4b5;
  border-radius: 50%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.eyes {
  position: absolute;
  top: 32px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 0 20px;
}

.eye {
  width: 14px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  animation: blink 3s infinite;
}

@keyframes blink {
  0%,
  96%,
  100% {
    transform: scaleY(1);
  }
  98% {
    transform: scaleY(0.1);
  }
}

.pupil {
  width: 7px;
  height: 7px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pupil-move 4s ease-in-out infinite;
}

@keyframes pupil-move {
  0%,
  100% {
    transform: translate(-50%, -50%);
  }
  25% {
    transform: translate(-30%, -50%);
  }
  75% {
    transform: translate(-70%, -50%);
  }
}

.mouth {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
}

.mouth-curve {
  width: 34px;
  height: 17px;
  border: 2px solid #d2691e;
  border-top: none;
  border-radius: 0 0 50px 50px;
  animation: mouth-ponder 2s ease-in-out infinite;
}

@keyframes mouth-ponder {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* 思考气泡 */
.thought-bubbles {
  position: absolute;
  top: -28px;
  right: -14px;
}

.bubble {
  position: absolute;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fa709a;
  font-size: 18px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: bubble-float 2s ease-in-out infinite;
}

.bubble-1 {
  width: 24px;
  height: 24px;
  right: 0;
  font-size: 14px;
  animation-delay: 0s;
}

.bubble-2 {
  width: 18px;
  height: 18px;
  right: 18px;
  top: 10px;
  font-size: 11px;
  animation-delay: 0.3s;
}

.bubble-3 {
  width: 12px;
  height: 12px;
  right: 28px;
  top: 18px;
  font-size: 8px;
  animation-delay: 0.6s;
}

@keyframes bubble-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 漂浮问号 */
.floating-marks .question-mark {
  position: absolute;
  font-size: 20px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.6);
  animation: float-up 3s ease-in-out infinite;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* ==================== 文字内容 ==================== */
.feedback-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  margin-top: 30px;
}

.feedback-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.feedback-title .emoji {
  display: inline-block;
  font-size: 32px;
  animation: emoji-bounce 0.6s ease-in-out;
}

@keyframes emoji-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.feedback-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

/* ==================== 文字动画 ==================== */
.bounce-in {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.shake-in {
  animation: shake-in 0.6s ease-out;
}

@keyframes shake-in {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}

.slide-up {
  animation: slide-up 0.5s ease-out 0.3s both;
}

.slide-up-delay {
  animation: slide-up 0.5s ease-out 0.5s both;
}

@keyframes slide-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-in {
  animation: fade-in 0.5s ease-out 0.3s both;
}

.fade-in-delay {
  animation: fade-in 0.5s ease-out 0.5s both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ==================== 自动关闭进度条 ==================== */
.auto-close-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.6),
    rgba(255, 255, 255, 0.9)
  );
  animation: progress-fill 2s linear forwards;
}

@keyframes progress-fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

/* ==================== 模态框进出动画 ==================== */
.feedback-modal-enter-active {
  animation: modal-zoom-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.feedback-modal-leave-active {
  animation: modal-zoom-out 0.3s ease-in;
}

@keyframes modal-zoom-in {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(180deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes modal-zoom-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .quiz-feedback-container {
    width: 85vw;
    height: auto;
    min-height: 300px;
    max-width: 280px;
  }

  .feedback-title {
    font-size: 24px;
  }

  .feedback-subtitle {
    font-size: 14px;
  }

  .trophy {
    width: 70px;
    height: 85px;
  }
}
</style>
