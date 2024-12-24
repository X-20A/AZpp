import { onMounted, computed } from 'vue';
import useStore from '@/store';
const store = useStore();
export default (await import('vue')).defineComponent({
    name: 'Bookmark',
    setup() {
        const bookmarks = computed(() => store.bookmarks);
        const toggleBookmark = (id) => {
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
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.bookmarks.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: ("empty") },
        });
    }
    for (const [bookmark] of __VLS_getVForSourceType((__VLS_ctx.bookmarks))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((bookmark.id)),
            ...{ class: ("list-items") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: ({}) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toggleBookmark(bookmark.id);
                } },
            ...{ class: ("bookmark-icon update-bookmark icon") },
            'data-id': ((bookmark.id)),
        });
        if (bookmark.fav_at !== 0) {
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
            ...{ class: ("list-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: ((bookmark.reconstructUrl('content'))),
            target: ("_blank"),
            rel: ("noopener noreferrer"),
        });
        (bookmark.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ style: ({}) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: ((bookmark.reconstructUrl('author'))),
            target: ("_blank"),
            rel: ("noopener noreferrer"),
        });
        (bookmark.author);
    }
    ['empty', 'list-items', 'bookmark-icon', 'update-bookmark', 'icon', 'list-title',];
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
//# sourceMappingURL=Bookmark.vue.js.map