<template>
    <div class="template-card" @click="$emit('click', template)">
        <!-- 徽章 -->
        <div class="card-badge">
            <span v-if="template.isHot" class="hot-badge">🔥 热门</span>
            <span v-if="template.isNew" class="new-badge">🆕 新品</span>
            <span v-if="template.isPro" class="pro-badge">💎 专业版</span>
        </div>

        <!-- 头部 -->
        <div class="card-header">
            <div class="template-icon">
                <el-icon :size="32">
                    <Document />
                </el-icon>
            </div>
        </div>

        <!-- 内容 -->
        <div class="card-content">
            <h3 class="card-title">{{ template.title }}</h3>
            <p class="card-description">{{ template.description }}</p>

            <!-- 统计信息 -->
            <div class="card-meta">
                <div class="stat-group">
                    <div class="meta-item">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>{{ template.questions }}题</span>
                    </div>
                    <div class="meta-item">
                        <el-icon>
                            <Clock />
                        </el-icon>
                        <span>{{ template.duration }}分钟</span>
                    </div>
                </div>
                <div class="rating-group">
                    <el-rate :model-value="template.rating" disabled size="small" show-score text-color="#ff9900"
                        score-template="{value}" />
                    <span class="usage-count">已使用 {{ formatUsageCount(template.usageCount) }}</span>
                </div>
            </div>

            <!-- 标签 -->
            <div class="card-tags">
                <el-tag v-for="tag in (template.tags || []).slice(0, 3)" :key="tag" size="small" type="info"
                    effect="plain">
                    {{ tag }}
                </el-tag>
            </div>
        </div>

        <!-- 底部按钮 -->
        <div class="card-footer">
            <el-button type="primary" size="small" @click.stop="$emit('use', template)">
                <el-icon>
                    <Plus />
                </el-icon>
                使用模板
            </el-button>
            <el-button size="small" @click.stop="$emit('preview', template)">
                <el-icon>
                    <View />
                </el-icon>
                预览
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { Document, Clock, Plus, View } from '@element-plus/icons-vue'

defineProps({
    template: {
        type: Object,
        required: true
    }
})

defineEmits(['click', 'use', 'preview'])

// 格式化使用次数
const formatUsageCount = (count) => {
    if (!count) return '0次'
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k次'
    }
    return count + '次'
}
</script>

<style lang="scss" scoped>
.template-card {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 350px;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        border-color: var(--color-primary-light-1);
    }

    .card-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        display: flex;
        gap: 8px;
        z-index: 1;
    }

    .hot-badge {
        background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .new-badge {
        background: linear-gradient(45deg, #4ecdc4, #44a08d);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .pro-badge {
        background: linear-gradient(45deg, #a8edea, #fed6e3);
        color: #333;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .template-icon {
            color: var(--color-primary-light-1);
        }

        .template-category {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            color: #0369a1;
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
    }

    .card-content {
        flex: 1;
        display: flex;
        flex-direction: column;

        .card-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            line-height: 1.4;
            padding-right: 80px; // 为徽章留出空间
        }

        .card-description {
            color: #666;
            font-size: 0.875rem;
            line-height: 1.6;
            //   margin-bottom: 16px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;

            //   overflow: hidden;
            // 加入滚动条
            ::-webkit-scrollbar {
                width: 8px;
            }

            ::-webkit-scrollbar-thumb {
                background: darken(#f0f0f0, 5%);
                border-radius: 4px;
            }

            ::-webkit-scrollbar-track {
                background: #f0f0f0;
                border-radius: 4px;
            }

            flex: 1;
        }

        .card-meta {
            margin-bottom: 12px;

            .stat-group {
                display: flex;
                gap: 16px;
                margin-bottom: 8px;

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8125rem;
                    color: #888;

                    .el-icon {
                        font-size: 14px;
                    }
                }
            }

            .rating-group {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;

                .usage-count {
                    font-size: 0.75rem;
                    color: #888;
                }
            }
        }

        .card-tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 16px;
            min-height: 28px;

            .el-tag {
                font-size: 0.75rem;
            }
        }
    }

    .card-footer {
        display: flex;
        gap: 8px;
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;

        .el-button {
            flex: 1;
            font-size: 0.875rem;

            .el-icon {
                margin-right: 4px;
            }
        }
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        padding: 20px;
        min-height: 380px;

        .card-title {
            font-size: 1rem;
            padding-right: 70px;
        }

        .card-meta {
            .stat-group {
                gap: 12px;
            }
        }

        .card-footer {
            flex-direction: column;
            gap: 8px;
        }
    }
}
</style>
