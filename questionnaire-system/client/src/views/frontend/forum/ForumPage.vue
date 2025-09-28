<template>
  <div class="forum">
    <div class="forum-header">
      <h1>问卷论坛</h1>
      <p class="forum-description">与其他用户交流问卷设计经验，分享见解和建议</p>
    </div>

    <!-- 发帖按钮和搜索 -->
    <div class="forum-controls">
      <el-button 
        type="primary" 
        :icon="Edit" 
        @click="showCreatePost = true"
        v-if="userStore.isLoggedIn"
      >
        发布新帖
      </el-button>
      <el-input
        v-model="searchQuery"
        placeholder="搜索帖子..."
        style="width: 300px"
        :prefix-icon="Search"
        @input="handleSearch"
      />
    </div>

    <!-- 分类标签 -->
    <div class="forum-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="问卷设计" name="design" />
        <el-tab-pane label="数据分析" name="analysis" />
        <el-tab-pane label="经验分享" name="experience" />
        <el-tab-pane label="问题求助" name="help" />
      </el-tabs>
    </div>

    <!-- 帖子列表 -->
    <div class="forum-posts">
      <el-card 
        v-for="post in filteredPosts" 
        :key="post.id" 
        class="post-card"
        shadow="hover"
        @click="goToPost(post.id)"
      >
        <div class="post-header">
          <div class="post-title">{{ post.title }}</div>
          <div class="post-meta">
            <el-tag :type="getTagType(post.category)" size="small">
              {{ getCategoryName(post.category) }}
            </el-tag>
            <span class="post-author">{{ post.author }}</span>
            <span class="post-time">{{ formatTime(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-content">{{ post.excerpt }}</div>
        <div class="post-stats">
          <span><el-icon><View /></el-icon> {{ post.views }}</span>
          <span><el-icon><ChatDotSquare /></el-icon> {{ post.replies }}</span>
          <span><el-icon><Star /></el-icon> {{ post.likes }}</span>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="forum-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="totalPosts"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 发帖对话框 -->
    <el-dialog
      v-model="showCreatePost"
      title="发布新帖"
      width="60%"
      @close="resetForm"
    >
      <el-form :model="postForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="postForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="postForm.category" placeholder="选择分类">
            <el-option label="问卷设计" value="design" />
            <el-option label="数据分析" value="analysis" />
            <el-option label="经验分享" value="experience" />
            <el-option label="问题求助" value="help" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreatePost = false">取消</el-button>
        <el-button type="primary" @click="submitPost">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";
import apiClient from "@/api/index.js";
import { 
  Edit, 
  Search, 
  View, 
  ChatDotSquare, 
  Star 
} from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const searchQuery = ref("");
const activeTab = ref("all");
const currentPage = ref(1);
const pageSize = ref(10);
const showCreatePost = ref(false);

const postForm = ref({
  title: "",
  category: "",
  content: ""
});

// 论坛数据
const forumPosts = ref([]);

// 加载论坛数据
const loadForumPosts = async () => {
  try {
    const posts = await apiClient.get('/forumPosts');
    forumPosts.value = posts;
  } catch (error) {
    console.error('加载论坛数据失败:', error);
    ElMessage.error('加载论坛数据失败');
  }
};

// 计算属性
const filteredPosts = computed(() => {
  let filtered = forumPosts.value;

  // 分类过滤
  if (activeTab.value !== "all") {
    filtered = filtered.filter(post => post.category === activeTab.value);
  }

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query)
    );
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
});

const totalPosts = computed(() => {
  let filtered = forumPosts.value;
  
  if (activeTab.value !== "all") {
    filtered = filtered.filter(post => post.category === activeTab.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query)
    );
  }

  return filtered.length;
});

// 方法
const getCategoryName = (category) => {
  const categories = {
    design: "问卷设计",
    analysis: "数据分析", 
    experience: "经验分享",
    help: "问题求助"
  };
  return categories[category] || category;
};

const getTagType = (category) => {
  const types = {
    design: "primary",
    analysis: "success",
    experience: "warning", 
    help: "danger"
  };
  return types[category] || "info";
};

const formatTime = (timeStr) => {
  const time = new Date(timeStr);
  const now = new Date();
  const diff = now - time;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return time.toLocaleDateString();
  }
};

const goToPost = (postId) => {
  // 这里可以跳转到帖子详情页
  ElMessage.info(`跳转到帖子 ${postId} 详情页`);
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleTabClick = () => {
  currentPage.value = 1;
};

const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleSizeChange = () => {
  currentPage.value = 1;
};

const resetForm = () => {
  postForm.value = {
    title: "",
    category: "",
    content: ""
  };
};

const submitPost = async () => {
  if (!postForm.value.title || !postForm.value.category || !postForm.value.content) {
    ElMessage.warning("请填写完整信息");
    return;
  }

  try {
    const newPost = {
      title: postForm.value.title,
      excerpt: postForm.value.content.substring(0, 100) + "...",
      content: postForm.value.content,
      category: postForm.value.category,
      author: userStore.profile?.nickname || "匿名用户",
      authorId: userStore.profile?.id || 0,
      views: 0,
      replies: 0,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    const createdPost = await apiClient.post('/forumPosts', newPost);
    forumPosts.value.unshift(createdPost);
    showCreatePost.value = false;
    resetForm();
    ElMessage.success("帖子发布成功！");
  } catch (error) {
    console.error('发布帖子失败:', error);
    ElMessage.error('发布帖子失败');
  }
};

onMounted(() => {
  loadForumPosts();
});
</script>

<style scoped>
.forum {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.forum-header {
  text-align: center;
  margin-bottom: 30px;
}

.forum-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.forum-description {
  color: #666;
  font-size: 16px;
}

.forum-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forum-tabs {
  margin-bottom: 20px;
}

.forum-posts {
  margin-bottom: 30px;
}

.post-card {
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-header {
  margin-bottom: 10px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.post-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.post-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #999;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.forum-pagination {
  display: flex;
  justify-content: center;
}
</style>