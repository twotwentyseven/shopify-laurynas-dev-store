<script setup>

import { ref, watch, onMounted, nextTick, computed, defineProps, defineEmits, onBeforeUnmount, toRef } from 'vue'

const props = defineProps({
    pagination: {
        required: false,
        type: [Array, Boolean],
        default: false,
    },
    group: {
        required: false,
        type: [String, Boolean],
        default: false,
    },
})

const emit = defineEmits(['update:modelValue'])

const initialPagination = toRef(props, 'pagination')
const internalPagination = ref(false)

const pagination = computed(() => {
    return internalPagination.value || (initialPagination.value || false)
})

const handlePaginationEvent = function(event) {
    internalPagination.value = event.detail
}

if(props.group) {
    document.addEventListener('theorem.emit.pagination.' + props.group, handlePaginationEvent)
}

const handleClick = function(url) {

    if(props.group) {

        fetch(url)
        .then(response => response.json())
        .then((response) => {
            document.dispatchEvent(new CustomEvent('theorem.emit.products.' + props.group, { detail: response.products }))
            document.dispatchEvent(new CustomEvent('theorem.emit.pagination.' + props.group, { detail: response.pagination }))
        })
    }
}

</script>

<template>

    <slot v-if="pagination === false" />

    <template v-else>
        
        <ul v-if="pagination.parts.length" class="pagination flex justify-center mt-10 -mx-1 lg:justify-center">

            <li><a href="#" @click.prevent="handleClick(pagination.previous?.url)" class="h-12 w-12 mx-1 rounded border flex justify-center items-center font-semibold" :class="{ 'border-primary-500': pagination.previous?.is_link, 'bg-neutral-200 border-neutral-200 text-neutral-300': !pagination.previous?.is_link }"><span class="material-symbols-outlined text-body-large lg:text-body-large-lg">arrow_back_ios_new</span></a></li>

            <template v-for="part in pagination.parts">
                <li v-if="part.is_link"><a class="h-12 w-12 mx-1 rounded border border-primary-500 flex justify-center items-center font-semibold text-neutral-900" href="#" @click.prevent="handleClick(part.url)" v-html="part.title"></a></li>
                <li v-else-if="part.title == pagination.current_page"><a href="#" class="active h-12 w-12 mx-1 rounded border border-primary-500 flex justify-center items-center font-semibold bg-primary-500 text-neutral-0" v-html="part.title"></a></li>
                <li v-else><a href="#" class="h-12 w-12 mx-1 rounded border border-primary-500 flex justify-center items-center font-semibold elipsis" v-html="part.title"></a></li>
            </template>

            <li><a href="#" @click.prevent="handleClick(pagination.next?.url)" class="h-12 w-12 mx-1 rounded border flex justify-center items-center font-semibold" :class="{ 'border-primary-500': pagination.next?.is_link, 'bg-neutral-200 border-neutral-200 text-neutral-300': !pagination.next?.is_link }"><span class="material-symbols-outlined text-body-large lg:text-body-large-lg">arrow_forward_ios</span></a></li>

        </ul><!-- pagination -->

    </template>
    
</template>

<style scoped>

</style>