<template>
  <transition name="feedback">
    <div v-if="visible" class="quiz-feedback" :class="feedbackType">
      <div class="feedback-content" :class="feedbackType">
        <div class="feedback-animation">
          <!-- 正确动画 -->
          <div v-if="feedbackType === 'correct'" class="correct-animation">
            <div class="star-burst">
              <div
                class="star"
                v-for="i in 8"
                :key="i"
                :style="{ transform: `rotate(${i * 45}deg)` }"
              ></div>
            </div>
            <div class="checkmark-circle">
              <svg
                class="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  class="checkmark-circle-svg"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  class="checkmark-check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
            <div class="confetti">
              <div
                class="confetti-piece"
                v-for="i in 15"
                :key="i"
                :style="getConfettiStyle(i)"
              ></div>
            </div>
          </div>

          <!-- 错误动画 -->
          <div v-else class="incorrect-animation">
            <div class="cross-circle">
              <svg
                class="cross"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  class="cross-circle-svg"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  class="cross-line"
                  d="M16 16 36 36 M36 16 16 36"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="shake-wave">
              <div class="wave" v-for="i in 3" :key="i"></div>
            </div>
          </div>
        </div>

        <div class="feedback-text" :class="feedbackType">
          <h2>{{ feedbackType === "correct" ? "太棒了！" : "再想想～" }}</h2>
          <p>{{ feedbackType === "correct" ? "回答正确" : "回答错误" }}</p>
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

// 生成随机的彩屑样式
const getConfettiStyle = (index) => {
  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f9ca24",
    "#6c5ce7",
    "#fd79a8",
  ];
  const color = colors[index % colors.length];
  const angle = (index / 15) * 360;
  const distance = 80 + Math.random() * 40;
  const duration = 0.6 + Math.random() * 0.3;

  return {
    "--confetti-color": color,
    "--confetti-angle": `${angle}deg`,
    "--confetti-distance": `${distance}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${Math.random() * 0.2}s`,
  };
};

// 自动关闭并触发下一题
watch(
  () => props.visible,
  (val) => {
    if (val) {
      setTimeout(() => {
        emit("finish");
      }, 1500); // 1.5秒后自动关闭
    }
  }
);
</script>

<style scoped>
.quiz-feedback {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.feedback-content {
  background: white;
  border-radius: 24px;
  padding: 60px 80px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.feedback-content.correct {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feedback-content.incorrect {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.feedback-animation {
  margin-bottom: 24px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 正确动画 */
.correct-animation {
  position: relative;
}

.star-burst {
  position: absolute;
  width: 120px;
  height: 120px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.star {
  position: absolute;
  width: 4px;
  height: 40px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  left: 50%;
  bottom: 50%;
  transform-origin: bottom center;
  animation: star-burst 0.6s ease-out forwards;
}

@keyframes star-burst {
  0% {
    height: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    height: 60px;
    opacity: 0;
  }
}

.checkmark-circle {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto;
}

.checkmark {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #fff;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #67c23a;
  animation: fill-correct 0.4s ease-in-out 0.4s forwards,
    scale-correct 0.3s ease-in-out 0.9s both;
}

.checkmark-circle-svg {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #fff;
  animation: stroke-correct 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke: #fff;
  animation: stroke-correct 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke-correct {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale-correct {
  0%,
  100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill-correct {
  100% {
    box-shadow: inset 0 0 0 50px rgba(103, 194, 58, 0.3);
  }
}

.confetti {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--confetti-color);
  top: 50%;
  left: 50%;
  opacity: 0;
  animation: confetti-fall 0.8s ease-out forwards;
  border-radius: 2px;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(
        calc(-50% + var(--confetti-distance) * cos(var(--confetti-angle))),
        calc(-50% + var(--confetti-distance) * sin(var(--confetti-angle)))
      )
      rotate(720deg);
  }
}

/* 错误动画 */
.incorrect-animation {
  position: relative;
}

.cross-circle {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto;
}

.cross {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #fff;
  stroke-miterlimit: 10;
  animation: shake-animation 0.5s ease-in-out;
}

.cross-circle-svg {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #fff;
  animation: stroke-incorrect 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.cross-line {
  stroke: #fff;
  stroke-width: 3;
  stroke-dasharray: 28;
  stroke-dashoffset: 28;
  animation: stroke-incorrect 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
}

@keyframes stroke-incorrect {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes shake-animation {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-8px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(8px);
  }
}

.shake-wave {
  position: absolute;
  width: 120px;
  height: 120px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: wave-expand 0.8s ease-out forwards;
}

.wave:nth-child(2) {
  animation-delay: 0.2s;
}

.wave:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes wave-expand {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* 文字样式 */
.feedback-text {
  color: white;
}

.feedback-text h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.feedback-text p {
  font-size: 18px;
  margin: 0;
  opacity: 0.95;
}

/* 进入/离开动画 */
.feedback-enter-active {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.feedback-leave-active {
  animation: fade-out 0.3s ease-out;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-out {
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
