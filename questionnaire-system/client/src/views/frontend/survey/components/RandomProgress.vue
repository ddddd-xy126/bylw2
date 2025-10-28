<template>
  <div class="random-progress">
    <DynamicProgress v-if="selected === 'dynamic'" :type="'circle'" :percent="percent" />
    <TreeGrowth v-else-if="selected === 'tree'" :progress="percent" />
    <LiquidFill v-else :model-value="percent" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DynamicProgress from '@/components/DynamicProgress.vue';
import TreeGrowth from '@/components/TreeGrowth.vue';
import LiquidFill from '@/components/LiquidFill.vue';

const props = defineProps({
  percent: { type: Number, default: 0 },
  questionnaireId: { type: [String, Number], default: null }
});

// 简单哈希函数（djb2），对相同问卷 id 保持一致的选择
const hashString = (str) => {
  if (str == null) return Math.floor(Math.random() * 1000);
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
  }
  return Math.abs(h);
};

const selected = computed(() => {
  const list = ['dynamic', 'tree', 'liquid'];
  const idStr = props.questionnaireId != null ? String(props.questionnaireId) : String(Math.random());
  const idx = hashString(idStr) % list.length;
  return list[idx];
});
</script>

<style scoped>
.random-progress {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
