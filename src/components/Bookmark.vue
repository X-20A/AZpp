<template>
  <div>
    <!-- もしブックマークがなければ、'empty'メッセージを表示 -->
    <p v-if="bookmarks.length === 0" class="empty">empty</p>
    <!-- ブックマークが存在する場合、リストを表示 -->
    <div v-for="bookmark in bookmarks" :key="bookmark.id" class="list-items">
      <div style="flex: 2; display: flex; align-items: center;">
        <p class="bookmark-icon update-bookmark icon" :data-id="bookmark.id" @click="toggleBookmark(bookmark.id)">
          <svg v-if="bookmark.fav_at !== 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M18,22A2,2 0 0,0 20,20V4C20,2.89 19.1,2 18,2H12V9L9.5,7.5L7,9V2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18Z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M18,2A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H18M18,4H13V12L10.5,9.75L8,12V4H6V20H18V4Z" />
          </svg>
        </p>
        <p class="list-title">
          <a :href="bookmark.reconstructUrl('content')" target="_blank" rel="noopener noreferrer">
            {{ bookmark.title }}
          </a>
        </p>
      </div>
      <p style="flex: 1;">
        <a :href="bookmark.reconstructUrl('author')" target="_blank" rel="noopener noreferrer">
          {{ bookmark.author }}
        </a>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, computed } from 'vue';
import useStore from '@/store';

const store = useStore();

export default {
  name: 'Bookmark',
  setup() {
    const bookmarks = computed(() => store.bookmarks);

    const toggleBookmark = (id: string) => {
      store.toggleFavAt(id);
    };


    // コンポーネントのマウント時にデータを取得
    onMounted(async () => {
    });

    return {
      bookmarks,
      toggleBookmark,
    };
  }
};
</script>

<style scoped>
</style>

