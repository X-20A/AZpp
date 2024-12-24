<template>
  <div>
    <div class="settings-box">
      <div>
        <span class="settings-key">書式</span>
      </div>
      <div>
        <div class="settings-switch">
          <button class="settings-is-horizontal custom-radio" :class="{ 'radio-selected': settings.is_horizontal }" @click="updateIsHorizontal(true)">
            横書き
          </button>
          <button class="settings-is-horizontal custom-radio" :class="{ 'radio-selected': !settings.is_horizontal }" @click="updateIsHorizontal(false)">
            縦書き
          </button>
        </div>
      </div>
    </div>

    <div class="settings-box">
      <div>
        <span class="settings-key">文字の大きさ(px)</span>
      </div>
      <div>
        <input class="custom-input settings-font-size" type="number" min="1" max="50" v-model="fontSize" />
      </div>
    </div>

    <div class="settings-box">
      <div>
        <span class="settings-key">スクロールの滑らかさ</span>
      </div>
      <div>
        <input class="custom-input settings-scroll-smooth-lv" type="number" min="3" max="30"
          v-model="scrollSmoothLv" />
      </div>
    </div>

    <div class="settings-box">
      <div>
        <span class="settings-key">テキスト選択にルビを含まない</span>
      </div>
      <div class="toggle-button-box">
        <label class="toggle-button">
          <input type="checkbox" class="settings-is-exclude-ruby toggle-button__checkbox"
            v-model="isExcludeRuby" />
        </label>
      </div>
    </div>

    <div class="settings-box">
      <div>
        <span class="settings-key">スクロール位置を記憶</span>
      </div>
      <div class="toggle-button-box">
        <label class="toggle-button">
          <input type="checkbox" class="settings-is-scroll-cache toggle-button__checkbox"
            v-model="isScrollCache" />
        </label>
      </div>
    </div>

    <div class="settings-box">
      <div>
        <span class="settings-key">テキスト欄の幅(%)</span>
      </div>
      <div>
        <input class="custom-input settings-body-padding" type="number" min="1" max="100" v-model="bodyPadding" />
      </div>
    </div>

    <div class="settings-box">
      <div>
        <span class="settings-key">テーマ</span>
      </div>
      <div>
        <div class="settings-switch">
          <button class="settings-theme custom-radio" :class="{ 'radio-selected': settings.theme_id === 0 }"
            @click="updateThemeId(0)">
            明
          </button>
          <button class="settings-theme custom-radio" :class="{ 'radio-selected': settings.theme_id === 1 }"
            @click="updateThemeId(1)">
            翠
          </button>
          <button class="settings-theme custom-radio" :class="{ 'radio-selected': settings.theme_id === 2 }"
            @click="updateThemeId(2)">
            空
          </button>
          <button class="settings-theme custom-radio" :class="{ 'radio-selected': settings.theme_id === 3 }"
            @click="updateThemeId(3)">
            紺
          </button>
          <button class="settings-theme custom-radio" :class="{ 'radio-selected': settings.theme_id === 4 }"
            @click="updateThemeId(4)">
            暗
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';
import useStore from '@/store';

const store = useStore();

export default {
  setup() {
    const settings = computed(() => store.settings);

    const updateIsHorizontal = (value: boolean) => {
      store.updateIsHorizontal(value);
    };

    const fontSize = computed({
      get: () => store.settings.font_size,
      set: (value: number) => store.updateFontSize(value)
    });

    const scrollSmoothLv = computed({
      get: () => store.settings.scroll_smooth_lv,
      set: (value: number) => store.updateScrollSmoothLv(value)
    });

    const isExcludeRuby = computed({
      get: () => store.settings.is_exclude_ruby,
      set: (value: boolean) => store.updateIsExcludeRuby(value)
    });

    const isScrollCache = computed({
      get: () => store.settings.is_scroll_cache,
      set: (value: boolean) => store.updateIsScrollCache(value)
    });

    const bodyPadding = computed({
      get: () => store.settings.body_padding,
      set: (value: number) => store.updateBodyPadding(value)
    });

    const updateThemeId = (value: number) => {
      store.updateThemeId(value);
    };

    return {
      settings,
      updateIsHorizontal,
      fontSize,
      scrollSmoothLv,
      isExcludeRuby,
      isScrollCache,
      bodyPadding,
      updateThemeId,
    };
  }
};
</script>

<style scoped>
</style>
