import { ref, onUnmounted } from 'vue';

/**
 * 答题计时器 Composable
 * 管理答题时间计算
 */
export function useAnswerTimer() {
  const startTime = ref(Date.now());
  const elapsedTime = ref(0);
  const timer = ref(null);

  // 格式化时间显示
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始计时
  const startTimer = () => {
    if (timer.value) {
      clearInterval(timer.value);
    }

    startTime.value = Date.now();
    elapsedTime.value = 0;

    timer.value = setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    }, 1000);
  };

  // 暂停计时
  const pauseTimer = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  };

  // 继续计时
  const resumeTimer = () => {
    if (!timer.value) {
      const pausedTime = elapsedTime.value;
      startTime.value = Date.now() - (pausedTime * 1000);

      timer.value = setInterval(() => {
        elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
      }, 1000);
    }
  };

  // 重置计时
  const resetTimer = () => {
    pauseTimer();
    startTime.value = Date.now();
    elapsedTime.value = 0;
  };

  // 停止计时
  const stopTimer = () => {
    pauseTimer();
  };

  // 组件卸载时清理
  onUnmounted(() => {
    stopTimer();
  });

  return {
    startTime,
    elapsedTime,
    formatTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer
  };
}
