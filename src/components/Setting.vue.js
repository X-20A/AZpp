import { computed } from 'vue';
import useStore from '@/store';
const store = useStore();
export default (await import('vue')).defineComponent({
    setup() {
        const settings = computed(() => store.settings);
        const updateIsHorizontal = (value) => {
            store.updateIsHorizontal(value);
        };
        const fontSize = computed({
            get: () => store.settings.font_size,
            set: (value) => store.updateFontSize(value)
        });
        const scrollSmoothLv = computed({
            get: () => store.settings.scroll_smooth_lv,
            set: (value) => store.updateScrollSmoothLv(value)
        });
        const isExcludeRuby = computed({
            get: () => store.settings.is_exclude_ruby,
            set: (value) => store.updateIsExcludeRuby(value)
        });
        const isScrollCache = computed({
            get: () => store.settings.is_scroll_cache,
            set: (value) => store.updateIsScrollCache(value)
        });
        const bodyPadding = computed({
            get: () => store.settings.body_padding,
            set: (value) => store.updateBodyPadding(value)
        });
        const updateThemeId = (value) => {
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
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("settings-key") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-switch") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.updateIsHorizontal(true);
            } },
        ...{ class: ("settings-is-horizontal custom-radio") },
        ...{ class: (({ 'radio-selected': __VLS_ctx.settings.is_horizontal })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.updateIsHorizontal(false);
            } },
        ...{ class: ("settings-is-horizontal custom-radio") },
        ...{ class: (({ 'radio-selected': !__VLS_ctx.settings.is_horizontal })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("settings-key") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ class: ("custom-input settings-font-size") },
        type: ("number"),
        min: ("1"),
        max: ("50"),
    });
    (__VLS_ctx.fontSize);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("settings-key") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ class: ("custom-input settings-scroll-smooth-lv") },
        type: ("number"),
        min: ("3"),
        max: ("30"),
    });
    (__VLS_ctx.scrollSmoothLv);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("settings-key") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("toggle-button-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: ("toggle-button") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("checkbox"),
        ...{ class: ("settings-is-exclude-ruby toggle-button__checkbox") },
    });
    (__VLS_ctx.isExcludeRuby);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("settings-key") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("toggle-button-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: ("toggle-button") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("checkbox"),
        ...{ class: ("settings-is-scroll-cache toggle-button__checkbox") },
    });
    (__VLS_ctx.isScrollCache);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("settings-key") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ class: ("custom-input settings-body-padding") },
        type: ("number"),
        min: ("1"),
        max: ("100"),
    });
    (__VLS_ctx.bodyPadding);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("settings-key") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-switch") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.updateThemeId(0);
            } },
        ...{ class: ("settings-theme custom-radio") },
        ...{ class: (({ 'radio-selected': __VLS_ctx.settings.theme_id === 0 })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.updateThemeId(1);
            } },
        ...{ class: ("settings-theme custom-radio") },
        ...{ class: (({ 'radio-selected': __VLS_ctx.settings.theme_id === 1 })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.updateThemeId(2);
            } },
        ...{ class: ("settings-theme custom-radio") },
        ...{ class: (({ 'radio-selected': __VLS_ctx.settings.theme_id === 2 })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.updateThemeId(3);
            } },
        ...{ class: ("settings-theme custom-radio") },
        ...{ class: (({ 'radio-selected': __VLS_ctx.settings.theme_id === 3 })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.updateThemeId(4);
            } },
        ...{ class: ("settings-theme custom-radio") },
        ...{ class: (({ 'radio-selected': __VLS_ctx.settings.theme_id === 4 })) },
    });
    ['settings-box', 'settings-key', 'settings-switch', 'settings-is-horizontal', 'custom-radio', 'radio-selected', 'settings-is-horizontal', 'custom-radio', 'radio-selected', 'settings-box', 'settings-key', 'custom-input', 'settings-font-size', 'settings-box', 'settings-key', 'custom-input', 'settings-scroll-smooth-lv', 'settings-box', 'settings-key', 'toggle-button-box', 'toggle-button', 'settings-is-exclude-ruby', 'toggle-button__checkbox', 'settings-box', 'settings-key', 'toggle-button-box', 'toggle-button', 'settings-is-scroll-cache', 'toggle-button__checkbox', 'settings-box', 'settings-key', 'custom-input', 'settings-body-padding', 'settings-box', 'settings-key', 'settings-switch', 'settings-theme', 'custom-radio', 'radio-selected', 'settings-theme', 'custom-radio', 'radio-selected', 'settings-theme', 'custom-radio', 'radio-selected', 'settings-theme', 'custom-radio', 'radio-selected', 'settings-theme', 'custom-radio', 'radio-selected',];
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
//# sourceMappingURL=Setting.vue.js.map