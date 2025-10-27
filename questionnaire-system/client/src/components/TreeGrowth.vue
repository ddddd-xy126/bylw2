<template>
  <div class="tree-growth-container">
    <canvas ref="canvasRef" width="600" height="300"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
});

const canvasRef = ref(null);
let ctx;
let width = 600;
let height = 500;

const maxGen = 8;
let branchLevels = [];

function generateBranches() {
  branchLevels = [];
  branchLevels[0] = [
    {
      x: width / 2,
      y: height,
      len: 60,
      angle: -Math.PI / 2,
      width: 6,
      gen: 0,
    },
  ];

  for (let g = 0; g < maxGen; g++) {
    branchLevels[g + 1] = [];
    for (const b of branchLevels[g]) {
      const x2 = b.x + Math.cos(b.angle) * b.len;
      const y2 = b.y + Math.sin(b.angle) * b.len;
      const nextLen = b.len * (0.7 + Math.random() * 0.1);
      const w = b.width * 0.7;
      branchLevels[g + 1].push({
        x: x2,
        y: y2,
        len: nextLen,
        angle: b.angle - (0.25 + Math.random() * 0.2),
        width: w,
        gen: b.gen + 1,
      });
      branchLevels[g + 1].push({
        x: x2,
        y: y2,
        len: nextLen,
        angle: b.angle + (0.25 + Math.random() * 0.2),
        width: w,
        gen: b.gen + 1,
      });
    }
  }
}

function drawBranch(b) {
  const { x, y, len, angle, width } = b;
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;

  const grad = ctx.createLinearGradient(x, y, x2, y2);
  grad.addColorStop(0, "#4e342e");
  grad.addColorStop(1, "#2e7d32");

  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x + (Math.random() - 0.5) * 20,
    y - len / 2,
    x2,
    y2
  );
  ctx.stroke();
}

function drawLeaves(progress) {
  ctx.save();
  ctx.fillStyle = "rgba(76,175,80,0.9)";
  ctx.shadowColor = "#00e676";
  ctx.shadowBlur = 6;

  const leafLevel = branchLevels[maxGen];
  const count = Math.floor(progress * leafLevel.length);
  for (let i = 0; i < count; i++) {
    const b = leafLevel[i];
    const x2 = b.x + Math.cos(b.angle) * b.len;
    const y2 = b.y + Math.sin(b.angle) * b.len;
    ctx.beginPath();
    ctx.ellipse(x2, y2, 4, 8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function draw(percent) {
  ctx.clearRect(0, 0, width, height);

  const totalStages = maxGen + 2; // +1 for leaves
  const stagePercent = 100 / totalStages;
  const stage = Math.floor(percent / stagePercent);
  const intra = (percent % stagePercent) / stagePercent;

  // 绘制完整层
  for (let i = 0; i < stage && i <= maxGen; i++) {
    branchLevels[i].forEach(drawBranch);
  }

  // 当前层的部分增长
  if (stage <= maxGen && branchLevels[stage]) {
    const visible = Math.floor(intra * branchLevels[stage].length);
    for (let i = 0; i < visible; i++) {
      drawBranch(branchLevels[stage][i]);
    }
  }

  // 最后阶段绘制叶子
  if (stage > maxGen) {
    const leafProgress = percent >= 100 ? 1 : intra;
    drawLeaves(leafProgress);
  }
}

onMounted(() => {
  const canvas = canvasRef.value;
  ctx = canvas.getContext("2d");
  width = canvas.width;
  height = canvas.height;
  generateBranches();
  draw(0);
});

watch(
  () => props.progress,
  (val) => {
    if (!ctx) return;
    draw(val);
  }
);
</script>

<style scoped lang="scss">
.tree-growth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #c8e6c9, #a5d6a7);
  border-radius: 16px;
  box-shadow: 0 0 25px rgba(0, 255, 100, 0.25);
  padding: 10px;

  canvas {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16px;
  }
}
</style>
