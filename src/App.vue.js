import { watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import useStore from '@/store';
import Bookmark from './components/Bookmark.vue';
import OpenedHistory from './components/OpenedHistory.vue';
import DoneHistory from './components/DoneHistory.vue';
import Setting from './components/Setting.vue';
// import Audio from './Audio.vue';
import { THEMES } from './classes/const';
const store = useStore();
export default (await import('vue')).defineComponent({
    components: {
        Bookmark,
        OpenedHistory,
        DoneHistory,
        Setting,
        // Audio
    },
    setup() {
        const { selected_tab, settings, page_info, current_content } = storeToRefs(store);
        const tab_labels = [
            { name: 'Bookmark', label: 'ブクマ' },
            { name: 'OpenedHistory', label: '閲覧履歴' },
            { name: 'DoneHistory', label: '読了履歴' },
            { name: 'Settings', label: '設定' },
        ];
        const body = document.body;
        const applyWritingMode = () => {
            const is_horizontal = store.settings.is_horizontal;
            if (is_horizontal) {
                body.style.writingMode = 'horizontal-tb';
            }
            else {
                body.style.writingMode = 'vertical-rl';
            }
        };
        const applyIsExcludeRuby = () => {
            const is_exclude_ruby = store.settings.is_exclude_ruby;
            const value = is_exclude_ruby ? "none" : "text";
            document.querySelectorAll("ruby rp, ruby rt").forEach((elem) => {
                elem.style.userSelect = value;
            });
        };
        const applyFontSize = () => {
            const font_size = store.settings.font_size;
            body.style.fontSize = `${font_size}px`;
        };
        const applyBodyPadding = () => {
            const is_horizontal = store.settings.is_horizontal;
            const body_padding = store.settings.body_padding;
            const value = is_horizontal
                ? `10% ${body_padding}%`
                : `${body_padding}% 10%`;
            body.style.padding = value;
        };
        const applyTheme = () => {
            const theme_id = store.settings.theme_id;
            const theme = THEMES[theme_id];
            body.style.backgroundColor = '#' + theme.bg_color;
            body.style.color = '#' + theme.font_color;
        };
        watch(() => settings.value.is_horizontal, applyWritingMode);
        watch(() => settings.value.is_exclude_ruby, applyIsExcludeRuby);
        watch(() => settings.value.font_size, applyFontSize);
        watch(() => [settings.value.is_horizontal, settings.value.body_padding], applyBodyPadding);
        watch(() => settings.value.theme_id, applyTheme);
        const wheel_event_listener = (event) => {
            if (store.settings.is_horizontal)
                return; // 横書きの場合は処理を終了
            event.preventDefault(); // デフォルトの縦スクロールを無効化
            const totalScroll = -event.deltaY; // ホイール操作のスクロール量
            const steps = store.settings.scroll_smooth_lv; // 分割数 これを増やすほど滑らかになる
            const stepAmount = totalScroll / steps; // 1回のスクロール量
            let currentStep = 0;
            function smoothScroll() {
                if (currentStep >= steps)
                    return; // 全てのステップが完了したら終了
                window.scrollTo(window.scrollX + stepAmount, 0); // 横スクロールの調整
                currentStep++;
                requestAnimationFrame(smoothScroll); // フレーム最適化
            }
            smoothScroll(); // アニメーション開始
        };
        /**
         * 任意の位置(右側からの百分率)にスクロール
         * @param {number} percentage 0 - 100
         */
        const scrollWithPercentage = (percentage) => {
            if (store.settings.is_horizontal) {
                scrollTo({
                    left: body.scrollWidth * (-percentage / 100)
                });
            }
            else {
                scrollTo(0, (percentage / 100) * (document.documentElement.scrollHeight - document.documentElement.clientHeight));
            }
        };
        const changeTab = (tab_type) => {
            store.updateSelectedTab(tab_type);
        };
        const toggleBookmark = (id) => {
            store.toggleFavAt(id);
        };
        const toggleDone = (id) => {
            store.toggleDoneAt(id);
        };
        const handleScroll = () => {
            store.refreshScrollPosition();
        };
        onMounted(async () => {
            await store.loadSaveData();
            // レイアウトを弄る前にスクロール位置を退避
            const scroll_position = store.current_content.last_scroll;
            body.style.margin = '0';
            applyWritingMode();
            applyIsExcludeRuby();
            applyFontSize();
            applyBodyPadding();
            applyTheme();
            if (store.settings.is_scroll_cache) {
                scrollWithPercentage(scroll_position);
            }
            window.addEventListener('scroll', handleScroll);
            window.addEventListener('wheel', wheel_event_listener, { passive: false });
        });
        return {
            Bookmark,
            OpenedHistory,
            DoneHistory,
            Setting,
            // Audio,
            selected_tab,
            tab_labels,
            content: current_content,
            page_info,
            changeTab,
            toggleBookmark,
            toggleDone,
        };
    }
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = {
        Bookmark,
        OpenedHistory,
        DoneHistory,
        Setting,
        // Audio
    };
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("modal-bg"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("modal-container"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("header-box"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("nav"),
    });
    for (const [tab, index] of __VLS_getVForSourceType((__VLS_ctx.tab_labels))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.changeTab(tab.name);
                } },
            key: ((index)),
            ...{ class: ("nav-content") },
            ...{ class: (({ 'nav-selected': __VLS_ctx.selected_tab === tab.name })) },
        });
        (tab.label);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("controller-box"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleBookmark(__VLS_ctx.page_info.id);
            } },
        ...{ class: ("bookmark-icon update-bookmark") },
        ...{ class: (({ 'bookmark-enable': __VLS_ctx.content.fav_at !== 0, 'bookmark-disable': __VLS_ctx.content.fav_at === 0 })) },
    });
    if (__VLS_ctx.content.fav_at !== 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: ("http://www.w3.org/2000/svg"),
            viewBox: ("0 0 24 24"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.path)({
            d: ("M18,22A2,2 0 0,0 20,20V4C20,2.89 19.1,2 18,2H12V9L9.5,7.5L7,9V2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18Z"),
        });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            xmlns: ("http://www.w3.org/2000/svg"),
            viewBox: ("0 0 24 24"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.path)({
            d: ("M18,2A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H18M18,4H13V12L10.5,9.75L8,12V4H6V20H18V4Z"),
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleDone(__VLS_ctx.page_info.id);
            } },
        ...{ class: ("done-icon update-done") },
        ...{ class: (({ 'done-enable': __VLS_ctx.content.done_at !== 0, 'done-disable': __VLS_ctx.content.done_at === 0 })) },
        ...{ style: ({}) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("generate-area"),
    });
    const __VLS_0 = {}.Bookmark;
    /** @type { [typeof __VLS_components.Bookmark, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.selected_tab === 'Bookmark') }, null, null);
    const __VLS_6 = {}.OpenedHistory;
    /** @type { [typeof __VLS_components.OpenedHistory, ] } */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.selected_tab === 'OpenedHistory') }, null, null);
    const __VLS_12 = {}.DoneHistory;
    /** @type { [typeof __VLS_components.DoneHistory, ] } */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.selected_tab === 'DoneHistory') }, null, null);
    const __VLS_18 = {}.Setting;
    /** @type { [typeof __VLS_components.Setting, ] } */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.selected_tab === 'Setting') }, null, null);
    ['nav-content', 'nav-selected', 'bookmark-icon', 'update-bookmark', 'bookmark-enable', 'bookmark-disable', 'done-icon', 'update-done', 'done-enable', 'done-disable',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
let __VLS_self;
//# sourceMappingURL=App.vue.js.map