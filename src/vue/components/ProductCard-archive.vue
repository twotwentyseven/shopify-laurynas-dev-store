<template>

    <div v-if="product != null" class="dynamic-product-card">

        <template v-if="loading" class="skeleton-card">
            <!-- loading... -->
        </template>

        <template v-else>

            <div class="product-card" :key="`product_card_${product.id}`">

                <!-- Images -->

                <div class="image-container" 
                @mouseenter="toggleSizeOptions();toggleHoverCardImage();" 
                @mouseleave="toggleSizeOptions();toggleHoverCardImage();"
                :class="[hoveredCardImage ? 'show-hover' : '' ]"
                >

                    <template v-if="selectedVariant?.images?.length">
                        <a :href="`/products/${product.handle}?variant=${selectedVariant?.id}`">
                            <div class="card-media image-wrap">
                                
                                <!-- If you hover over a variant, show that variants images instead as a quickHoverImages  -->

                                <template v-if="quickHoverImages?.length">
                                    <img v-if="lazyLoading" :src="quickHoverImages[0]?.src" loading="lazy" :alt="quickHoverImages[0]?.alt">
                                    <img v-else :data-src="quickHoverImages[0]?.src" :alt="quickHoverImages[0]?.alt" class="lazyload">                                
                                </template>

                                <!-- Otherwise show the selected variant image -->

                                <template v-else>
                                    <img v-if="lazyLoading" :src="selectedVariant.images[0]?.src" loading="lazy" :alt="selectedVariant.images[0]?.alt">
                                    <img v-else :data-src="selectedVariant.images[0]?.src" :alt="selectedVariant.images[0]?.alt" class="lazyload">
                                    
                                    <template v-if="selectedVariant.images.length > 1">
                                        <img v-if="lazyLoading" :src="selectedVariant.images[1]?.src" loading="lazy" :alt="selectedVariant.images[1]?.alt" class="hover-image">
                                        <img v-else :data-src="selectedVariant.images[1]?.src" :alt="selectedVariant.images[1]?.alt" class="hover-image lazyload">                                
                                    </template>                            
                                </template>

                            </div>
                        </a>
                    </template>

                    <template v-else-if="product?.images?.length">

                        <a :href="`/products/${product.handle}`">
                            <div class="card-media image-wrap">
                                <img v-if="lazyLoading" :src="product.images[0]?.src" loading="lazy" :alt="product.images[0]?.alt">
                                <img v-else :data-src="product.images[0]?.src" :alt="product.images[0]?.alt" class="lazyload">
                            </div>
                        </a>  

                    </template>
                    
                    <!-- Size option hover -->

                    <template v-if="!product.has_only_default_variant && product?.options?.length > 1">
                        <div class="size-option-wrap" :class="[showSizeOptions ? 'active' : '']">
                            <div class="inner">
                                <div class="info-title" 
                                v-if="sizeOptionVariantStatus?.value" 
                                :class="[ sizeOptionVariantStatus?.class ? sizeOptionVariantStatus.class : '' ]"
                                >{{ sizeOptionVariantStatus?.value }}</div>

                                <ul class="size-options">
                                    <li v-for="(ov,ovIndex) in product.options[1].values" 
                                    :key="`size_opt_value_${ov}_index_${ovIndex}`" 
                                    :class="[selectedOptions.includes(ov) ? 'active' : '']">
                                        <a href="#" 
                                        @click.prevent="selectOption({position:2,value:ov})"
                                        >{{ ov }}</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </template>

                </div>

                <div class="card-details">

                    <small class="selected-colour-title" v-if="!product.has_only_default_variant && selectedVariant?.option1">{{ selectedVariant?.option1}}</small>

                    <!-- Variant Options -->

                    <template v-if="!product.has_only_default_variant">

                        <template v-for="(opt,optIndex) in product.options" :key="'option_'+opt.position+'_'+opt.name">

                            <div class="row-item colour-option option1 option-wrapper" v-if="opt.name === 'Color'">

                                <div class="radio-buttons" :class="[opt.name === 'Color' ? 'rounded size-small' : '']">

                                    <label class="rb-label" v-for="(ov,ovIndex) in opt.values" :key="product.id + '_option'+opt.position+'_' + ov">
                                        <input class="sr-only peer" :name="product.id + '_option'+opt.position" type="radio" :value="ov" :checked="selectedOptions.includes(ov)" @change="selectOption({position:opt.position,value:$event.target.value})"/>
                                        <div class="rb-item" :style="{backgroundColor: (product.optionsWithLibraryValues[optIndex][ovIndex]?.hexcode ? product.optionsWithLibraryValues[optIndex][ovIndex].hexcode : ov)}" v-if="opt.name === 'Color' ? true : false"></div>
                                        <div class="rb-item" v-else>{{ ov }}</div>
                                    </label>

                                </div>								

                            </div>

                        </template>						

                    </template>

                    <!-- Title & price -->

                    <div class="product-info">
                        <p class="title">{{ product.title }}</p>
                        <p class="price">{{ selectedVariant?.price ? selectedVariant.price : product.price }}</p>
                    </div>                    

                    <div class="row-item">

                        <div class="action-buttons">

                            <div class="left-wrap">
                                <button class="btn btn-dark hover-outline-dark" @click.prevent="$emit('triggerAddToCart',{variant:selectedVariant,event:$event})" v-if="selectedVariant.available">Add to Cart</button>
                                <button class="btn btn-dark disabled" disabled v-else>Out of stock</button>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </template>

    </div>

</template>

<script>
    import { computed, onBeforeMount, onMounted, onUpdated, reactive, ref } from 'vue';
    import useDetectBrowserFeatures from '../composition/useDetectBrowserFeatures';
    
    export default {
        name:"Product Card",
        props: {
            productObject:{
                type: Object,
                default: null
            }
        },
        setup(props) {
            const { lazyLoading, isMobile } = useDetectBrowserFeatures();
            
            /* 
            *  To do:
            *    - Pass this in via a prop? 
            *    - generate the data for it via a section, block data?
            */

            let tempColourLibrary = [
                {
                    id:'white',
                    hexcode:'#f0f4ef',
                },
                {
                    id:'cream',
                    hexcode:'#eccfc3',
                },
                {
                    id:'toad',
                    hexcode:'#89CE94',
                },
                {
                    id:'red-magma',
                    hexcode:'#b9314f',
                }                    
            ]

            const colourLibrary = window?.colour_library || tempColourLibrary;

            const _product = reactive(normalizeProduct(props.productObject));

            const selectedVariant = computed(() => _product.selected_variant);
            const selectedOptions = computed(() => selectedVariant.value?.options);
            const productVariants = computed(() => _product.variants);
            const allProductOptions = computed(() => _product.options);
            const optionValues = computed(() => allProductOptions.value.map(option => option.values));
            const quickHoverImages = ref([]);

            let hoveredVariant = ref(null);
            let showSizeOptions = ref(false);
            let hoveredCardImage = ref(false);

            let sizeOptionVariantStatus = computed(() => {
                let _variant = selectedVariant.value
                if( hoveredVariant.value != null ) _variant = hoveredVariant.value
                return handleStockMessages(_variant)
            })

            function handleStockMessages(variant = null) {
                if (variant == null) return; 

                // message is an object with a value and/or color and/or class.
                const message = {}
                
                const invPolicy = variant?.inventory_policy;
                const available = variant?.available;
                const invQuantity = variant?.inventory_quantity ? parseInt(variant?.inventory_quantity) : null;

                if(available || invPolicy === 'continue') {

                    if(invQuantity < 5 && invQuantity > 1) {
                        message.value = 'Low Stock'
                        message.class = 'text-danger-light'
                    }
                    else if(invQuantity === 1) {
                        message.value = 'Last one!'
                        message.class = 'text-danger'
                    }
                    else {
                        message.value = 'In Stock'
                        message.class = 'text-success'
                    }

                    if(invQuantity <= 0 && invPolicy === 'deny') message.value = 'Out of Stock'

                } else message.value = 'Out of Stock'
                

                return message;
            }

            function selectOption({ position, value }) {
                const newOptions = [...selectedOptions.value];
                newOptions[position - 1] = value;

                const newSelectedVariant = productVariants.value.filter(variant => {

                    if (optionValues.value.length < 2) {
                        if (variant.options[0] !== newOptions[0]) return false;
                    } else {
                        for (let i = 0; i < newOptions.length; i++) {
                            if (variant.options[i] !== newOptions[i]) return false;
                        }
                    }

                    return true;
                });

                _product.selected_variant = newSelectedVariant[0];
            }

            function toggleHoverCardImage() {
                hoveredCardImage.value = !hoveredCardImage.value;
            }

            function toggleSizeOptions() {
                // check if the selected variant has a 2nd option.
                if(selectedVariant.value != null && selectedVariant.value?.option2) showSizeOptions.value = !showSizeOptions.value;
                else showSizeOptions.value = false;
            }

            // Utility Methods

            function findVariantsFromOptions(chosenOptions = null) {
                if(chosenOptions == null) return;

                const options = chosenOptions;
                const found = productVariants.value.find(variant => {

                    for (let i = 0; i < options.length; i++) {
                        if(variant.options[i] !== options[i]) return false;
                    }
                    
                    return true;
                });

                return found;
            }

            function resetQuickViewData() {
                quickHoverImages.value = [];
            }

            function updateQuickViewData(optionIndex,optionValue) {
                // take the optionIndex and optionValue and find the matching variant
                let tempOptions = [...selectedOptions.value]
                if(optionIndex < tempOptions.length) tempOptions[optionIndex] = optionValue;
                const foundVariant = findVariantsFromOptions(tempOptions);

                if( foundVariant == null ) return;
                quickHoverImages.value = foundVariant?.images ? foundVariant.images : null;

            }

            function getLibraryData({ library, key }){
                if(library == null || key == null ) return;
                const libraryHandle = shopifyHandleize(library);
                const keyHandle = shopifyHandleize(key);
                let returnedObj = null

                if(libraryHandle === 'color' || libraryHandle === 'colour' ) {
                    let foundColourObject = colourLibrary.find(obj => obj.id === keyHandle);
                    returnedObj = foundColourObject;
                    if(returnedObj != null) returnedObj.originalValue = key;
                    return returnedObj;
                }
                
                // more libraries can go here

                return returnedObj;
            }

            function normalizeProduct(product = null) {
                // Guard clause - to hide the product card check the _product object from the tempalte
                if( product == null ) return;
                let tempProduct = product;

                // Every product has itself as a variant by default.
                // If the selected variant is falsy then we set it to the first variant in the variants array.
                if(!tempProduct?.selected_variant && tempProduct?.variants.length) tempProduct.selected_variant = tempProduct.variants[0];

                // loop over the product options and build up
                // an array of objects that contain either the
                // option value (if no matching key was found in any library)
                // or an object containing the data matching that key
                if(tempProduct?.options) {
                    let optionsWithLibraryValues = [];

                    tempProduct.options.forEach(o => {
                        let tempValuesArray = [];
                        o.values.forEach(value => {
                            let result = getLibraryData({ library:o.name, key: value})
                            if(result != null) tempValuesArray.push(result)
                            else tempValuesArray.push({originalValue:value})
                        })
                        optionsWithLibraryValues.push(tempValuesArray);
                    });

                    tempProduct.optionsWithLibraryValues = optionsWithLibraryValues;
                }

                return {
                    ...tempProduct
                }
            }            

            // Bring this into a common.js and import.

            function shopifyHandleize(str) {
                str = str.toLowerCase();
            
                var toReplace = ['"', "'", "\\", "(", ")", "[", "]"];
                
                // For the old browsers
                for (var i = 0; i < toReplace.length; ++i) {
                    str = str.replace(toReplace[i], "");
                }
            
                str = str.replace(/\W+/g, "-");
            
                if (str.charAt(str.length - 1) == "-") {
                    str = str.replace(/-+\z/, "");
                }
            
                if (str.charAt(0) == "-") {
                    str = str.replace(/\A-+/, "");
                }
            
                return str
            };


            return {
                colourLibrary,
                lazyLoading,
                showSizeOptions,
                hoveredCardImage,
                sizeOptionVariantStatus,

                product: _product,
                selectedOptions,
                selectedVariant,
                quickHoverImages,
                toggleSizeOptions,
                toggleHoverCardImage,

                resetQuickViewData,
                updateQuickViewData,
                selectOption
            }
        },
        data(){
            return {
                loading: false
            }
        }
    }
</script>