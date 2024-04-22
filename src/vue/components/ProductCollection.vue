<script setup>

import { ref, watch, onMounted, nextTick, computed, defineProps, defineEmits, onBeforeUnmount, toRef } from 'vue'

const props = defineProps({
    products: {
        required: false,
        type: [Array, Boolean],
        default: false,
    },
    metafields: {
        required: false,
        type: [Array, Boolean],
        default: false,
    },
    colours: {},
    content: {},
    productUrl: {},
    group: {
        required: false,
        type: [String, Boolean],
        default: false,
    },
})

const emit = defineEmits(['update:modelValue'])

const initialProducts = toRef(props, 'products')
const colours = toRef(props, 'colours')
const content = toRef(props, 'content')
const productUrl = toRef(props, 'productUrl')
const products = ref(false)
const metafields = toRef(props, 'metafields')

const productCards = computed(() => {
    return products.value || (initialProducts.value || false)
})

const handleProductsEvent = function(event) {
    products.value = event.detail
}

const handleMetafieldsEvent = function(event) {
    metafields.value = event.detail
}

const productMetafields = function(product) {
    // console.log(metafields.value)
    return metafields.value.find(x => x.id == product.id)
}

if(props.group) {
    document.addEventListener('theorem.emit.products.' + props.group, handleProductsEvent)
    document.addEventListener('theorem.emit.metafields.' + props.group, handleMetafieldsEvent)
}

</script>

<template>

    <slot v-if="productCards === false" />

    <template v-else>
        
        <product-card v-for="product in productCards" :colours="colours" :key="product.id" :product-object="product" :metafield-object="productMetafields(product)" :content="content"></product-card>

    </template>
    
</template>

<style scoped>

</style>