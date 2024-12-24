import { onMounted } from "vue";
import useStore from '@/store';
const store = useStore();
export default (await import('vue')).defineComponent({
    name: "OpenedHistory",
    setup() {
        const openedHistories = store.opened_histories;
        const deleteItem = (id) => {
            store.deleteOpenedAt(id);
        };
        onMounted(() => {
        });
        return {
            openedHistories,
            deleteItem,
        };
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (!__VLS_ctx.openedHistories.length) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: ("empty") },
        });
    }
    for (const [content] of __VLS_getVForSourceType((__VLS_ctx.openedHistories))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((content.id)),
            ...{ class: ("list-items") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: ({}) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: ("list-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: ((content.reconstructUrl('content'))),
            target: ("_blank"),
            rel: ("noopener noreferrer"),
        });
        (content.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ style: ({}) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: ((content.reconstructUrl('author'))),
            target: ("_blank"),
            rel: ("noopener noreferrer"),
        });
        (content.author);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.deleteItem(content.id);
                } },
            ...{ class: ("delete-icon-box icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: ("0 0 24 24"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
            ...{ class: ("delete-icon") },
            d: ("M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"),
        });
    }
    ['empty', 'list-items', 'list-title', 'delete-icon-box', 'icon', 'delete-icon',];
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
//# sourceMappingURL=OpenedHistory.vue.js.map