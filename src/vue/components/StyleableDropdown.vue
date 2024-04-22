<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>

import { stringify } from 'postcss';
import { ref, watch, onMounted, nextTick, computed, defineProps, defineEmits, onBeforeUnmount, toRef } from 'vue'

const props = defineProps({
    labelClasses:{
        type:String
    },
    modelValue: {
        required: false,
    },
    defaultToFirstOption: {
        type: Boolean,
        default: true,
        required: false,
    },
    title:{
        type:String
    }
})

const emit = defineEmits(['update:modelValue'])

const select = ref(null)
const wrapper = ref(null)
const isOpen = ref(false)
const selectedIndex = ref(null)
const selectOptions = ref(false)
const internalValue = ref(props.modelValue)

const propModelValue = toRef(props, 'modelValue')

const toggleOpenState = function() {
    isOpen.value = !isOpen.value
}

const watchClickOutside = function(e) {
    if (!wrapper.value.contains(event.target)) { 
        isOpen.value = false
    }
}

const supportKeyboardNavigation = function(event) {
    // press down -> go next
    if (event.keyCode === 40) {
        handleKeyUp(event)
    }
    // press up -> go previous
    if (event.keyCode === 38) {
        handleKeyDown()
    }
    // // press Enter or space -> select the option
    if (event.keyCode === 13 || event.keyCode === 32 || event.keyCode === 27) {
        isOpen.value = false
    }
}

const handleKeyUp = function(event) {
    if(selectedIndex.value < (selectOptions.value.length - 1)) {
        let adjustment = 1
        while(Array.from(select.value.children)[selectedIndex.value + adjustment]?.disabled) {
            adjustment += 1
        }
        selectedIndex.value += adjustment
    }
}

const handleKeyDown = function(event) {
    if(selectedIndex.value > 0) {
        let adjustment = -1
        while(Array.from(select.value.children)[selectedIndex.value + adjustment]?.disabled ?? false) {
            adjustment -= 1
        }
        selectedIndex.value += adjustment
    }
}

const updateInternalOptions = function() {
    selectOptions.value = []

    Array.from(select.value.children).forEach((option) => {
        selectOptions.value.push(option.textContent)
    })

    if(props.defaultToFirstOption && internalValue.value == undefined && select.value.selectedIndex == -1) {
        selectedIndex.value = 0
    } else {
        selectedIndex.value = select.value.selectedIndex
    }
    internalValue.value = select.value.value

}

const updateSelectIndex = function(index) {
    if(!Array.from(select.value.children)[index]?.disabled) {
        selectedIndex.value = index
        isOpen.value = false
    }
}

const getOptionAttrs = function(index) {
    // console.log(select.value.children[index].attributes)
    return Array.from(select.value.children[index].attributes).reduce((acc, val) => { acc[val.nodeName] = val.nodeValue; return acc }, {}) ?? {}
}

const modelValue = computed({
    get: () => {
        return internalValue.value
    },
    set: (newValue) => {
        internalValue.value = newValue
        emit('update:modelValue', newValue)
    }
})

watch(isOpen, () => {
    if(isOpen.value) {
        document.addEventListener("click", watchClickOutside);
        document.addEventListener("keydown", supportKeyboardNavigation);
    } else {
        document.removeEventListener("click", watchClickOutside);
        document.removeEventListener("keydown", supportKeyboardNavigation);
    }
})

watch(selectedIndex, (index) => {
    modelValue.value = Array.from(select.value.children)[index]?._value
})

watch(modelValue, (index) => {
    nextTick(() => {
        selectedIndex.value = select.value.selectedIndex
    })
})

watch(propModelValue, () => {
    modelValue.value = propModelValue.value
})

const selectedOptionLabel = computed(() => {
    return selectOptions.value[selectedIndex.value] ?? ''
})

const observer = new MutationObserver(updateInternalOptions);

onMounted(() => {

    observer.observe(select.value, {
        childList: true,
        subtree: true 
    })

    updateInternalOptions()
 
})

onBeforeUnmount(() => {
    observer.disconnect()
})

</script>

<template>

    <div class="customselect__wrapper" ref="wrapper">
        <select class="nativeselect" ref="select" v-bind="$attrs" v-model="modelValue">
            <slot />
        </select>

        <div @click="toggleOpenState"
             :class="{ 'customselect__input--active': isOpen }" 
             class="customselect__input" 
             :aria-hidden="!isOpen">
            <div class="customselect__label" :class="props.labelClasses">{{ selectedOptionLabel }}</div>
            <div class="customselect__options">
                <div v-for="(option, index) in selectOptions" class="customselect__option" v-bind="getOptionAttrs(index)" :class="{ 'customselect__option--active': selectedIndex == index }" @click.prevent.stop="updateSelectIndex(index)">{{ option }}</div>
            </div>
        </div>
    </div>
    
</template>