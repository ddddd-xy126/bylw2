<template>
    <div class="liquid-container">
        <canvas ref="canvas" class="liquid-canvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Number, default: 40 }, // 百分比 0~100
})

const emit = defineEmits(['update:modelValue'])

const canvas = ref(null)

let animationFrame = null
let config = null

onMounted(() => {
    const c = canvas.value
    const ctx = c.getContext('2d')

    function resize() {
        const ratio = window.devicePixelRatio || 1
        const w = c.clientWidth
        const h = c.clientHeight
        c.width = w * ratio
        c.height = h * ratio
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    config = {
        current: props.modelValue,
        target: props.modelValue,
        speed: 0.02,
        wave1: { amp: 14, len: 220, spd: 0.9, phase: 0 },
        wave2: { amp: 9, len: 140, spd: 1.4, phase: Math.PI },
        time: 0,
        bubbles: []
    }

    class Bubble {
        constructor(x, y, r, speed) {
            this.x = x; this.y = y; this.r = r; this.speed = speed; this.alpha = 0.8
        }
        update(dt, h) {
            this.y -= this.speed * dt
            this.alpha -= 0.002 * dt
            return this.y + this.r > 0 && this.alpha > 0
        }
    }

    function draw() {
        const w = c.clientWidth
        const h = c.clientHeight
        ctx.clearRect(0, 0, w, h)
        const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.clip()

    // 背景（改为更清新的蓝绿色渐变）
    const bgGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r)
    // 上方略带青绿色的浅色，底部稍微暖一些以增强层次
    bgGrad.addColorStop(0, '#e0fbff') // 非常浅的青蓝
    bgGrad.addColorStop(0.6, '#c7f3ff')
    bgGrad.addColorStop(1, '#eaf9f6') // 带一点暖的浅色
    ctx.fillStyle = bgGrad
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r)

        // 液位高度
        const p = config.current / 100
        const fillY = cy + r * (1 - 2 * p)

        // 波浪
        drawWave(config.wave2, fillY, 0.6)
        drawWave(config.wave1, fillY, 0.9)

        // 液体渐变覆盖（调整为更清新的蓝绿色，并加强高光）
        const grad = ctx.createLinearGradient(0, fillY - r * 0.3, 0, cy + r)
        grad.addColorStop(0, 'rgba(102,226,217,0.95)') // 青绿色高光
        grad.addColorStop(0.6, 'rgba(79,178,255,0.9)')
        grad.addColorStop(1, 'rgba(47,125,255,0.95)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = grad
        ctx.fillRect(cx - r, fillY, 2 * r, cy + r - fillY)
        ctx.globalCompositeOperation = 'source-over'

        // 气泡
        drawBubbles(fillY, cy + r)

        // 光影
        const shine = ctx.createRadialGradient(cx, cy - r * 0.6, 0, cx, cy - r * 0.6, r)
        shine.addColorStop(0, 'rgba(255,255,255,0.12)')
        shine.addColorStop(1, 'transparent')
        ctx.fillStyle = shine
        ctx.fillRect(cx - r, cy - r, 2 * r, r * 1.2)

        // 百分比文字（使用更深的色值以在浅背景上保持可读性）
        ctx.fillStyle = '#08324a'
        ctx.font = `bold ${r * 0.35}px Poppins`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(Math.round(config.current) + '%', cx, cy)

        ctx.restore()

        // 外环
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 3
        ctx.stroke()
    }

    function drawWave(wave, fillY, alpha) {
        const w = c.clientWidth
        const h = c.clientHeight
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.beginPath()
        const step = 2
        ctx.moveTo(0, h)
        ctx.lineTo(0, fillY)
        for (let x = 0; x <= w; x += step) {
            const theta = (x / wave.len) * Math.PI * 2 + wave.phase + config.time * wave.spd
            const y = Math.sin(theta) * wave.amp + fillY
            ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.closePath()
        const grad = ctx.createLinearGradient(0, fillY - 50, 0, h)
        grad.addColorStop(0, 'rgba(79,228,255,0.6)')
        grad.addColorStop(1, 'rgba(47,125,255,0.6)')
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
    }

    function drawBubbles(fillY, bottom) {
        if (Math.random() < 0.04) {
            const x = Math.random() * c.clientWidth
            const r = 2 + Math.random() * 6
            const y = bottom - Math.random() * 10
            const speed = 20 + Math.random() * 30
            config.bubbles.push(new Bubble(x, y, r, speed))
        }
        ctx.save()
        for (let i = config.bubbles.length - 1; i >= 0; i--) {
            const b = config.bubbles[i]
            if (b.y > fillY && b.update(1, bottom)) {
                ctx.beginPath()
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(200,240,255,${b.alpha})`
                ctx.fill()
            } else config.bubbles.splice(i, 1)
        }
        ctx.restore()
    }

    function animate() {
        config.time += 0.02
        const diff = config.target - config.current
        config.current += diff * config.speed
        if (Math.abs(diff) < 0.05) config.current = config.target
        draw()
        animationFrame = requestAnimationFrame(animate)
    }

    animate()
})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrame)
})

// 监听外部 v-model 更新
watch(() => props.modelValue, (v) => {
    if (config) config.target = Math.max(0, Math.min(100, v))
})
</script>

<style scoped lang="scss">
.liquid-container {
  width: 320px;
  aspect-ratio: 1;
  
  .liquid-canvas {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
