<template>
    <slot
        :product="product"
        :metafields="metafields"
        :selectedOptions="selectedOptions"
        :selectedVariant="selectedVariant"
        :excludedVariant="excludedVariant"
        :groupedOptions="groupedOptions"
        :loading="loading"
        :optionIsAvailable="optionIsAvailable"
        :quantity="quantity"
        :modal="modal"
        :formatCurrency="formatCurrency"
        :subToggle="subToggle"
        :increment="increment"
        :decrement="decrement"
        :subState="subState">

        <div v-if="loading" class="product-card loading-card" :class="[fullWidth ? 'w-full' : 'm-2 lg:m-3 w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]']">
            
            <div class="relative">

                <div class="img-wrap pt-[56.25%] bg-neutral-400 animated-loading"></div>

            </div>

            <div class="product-details pt-[40%] bg-neutral-300 animated-loading"></div>

        </div>

        <template v-else>
    
            <div v-if="product != null" data-product-card class="product-card text-left rounded-2xl relative group flex flex-col" :class="[ background, {'h-full': fullHeight}, fullWidth ? 'w-full' : 'm-2 lg:m-3 w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] ']" data-add-class="w-full" data-remove-class="w-[calc(50%-1rem)]">

                <span v-if="metafields?.metafields?.flag" class="absolute right-2 top-2 rounded uppercase flex items-center justify-center font-semibold px-2 py-1 z-[11] bg-secondary-900 text-tertiary-900 text-body-medium-lg | ">
                    {{ metafields?.metafields?.flag?.value }}
                </span>
                <!-- TODO if no prod image this errors out so need to add optional ? bc media doesn't have length if it doesn't exist DOH! -->
                <div class="relative pt-full test" :class="{'hover-wrapper': product?.media?.length > 1}">
                    <a :href="productUrl" class="img-wrap cursor-pointer absolute top-0 left-0 h-full w-full">
                        <img :src="product?.media[0]?.src" :alt="product?.media[0]?.alt" class="primary-img w-full h-full object-cover rounded-2xl" loading="lazy">
                    </a>
                    <a v-if="product?.media?.length > 1" :href="productUrl" class="img-wrap img-wrap-hover cursor-pointer z-10 absolute opacity-0 top-0 left-0 h-full w-full transition-all duration-animation-speed [@media(hover:hover)]:group-hover:opacity-100 s  " data-lifestyle-img>
                        <img :src="product?.media[1]?.src" :alt="product?.media[1]?.alt" class="hover-img h-full w-full object-cover rounded-2xl" loading="lazy" :style="'background:' + metafields?.metafields?.background_colour?.value?.custom_colour" :class="'bg-'+metafields?.metafields?.background_colour?.value?.defined_colors + '-' + metafields?.metafields?.background_colour?.value?.defined_colors_shade">
                    </a>
                    
                </div>

                <div
                    :key="`product_card_${product.id}`"
                    data-product-details
                    :data-product-id="`${product.id}`"
                    class="product-details flex flex-col shrink grow basis-auto justify-between " :class="color">

                    <a :href="productUrl"  class="my-4 block">
                        <div @touchstart="touchStartHandler($event)" @touchend="touchEndHandler($event)">
                            <p data-match-height="product-title" class="title | font-headline font-normal text-headline-5 uppercase mb-2 | lg:text-headline-5-lg">{{ product.title }}</p>

                            <template v-if="(product.variants.length > 1 && !product.requires_selling_plan) || product.requires_selling_plan">
                                <span class="price inline-block text-body-medium font-semibold mb-2" >From {{ formatCurrency(product.price_min) }}</span>
                            </template>
                            
                            <template v-else>
                                <span class="price inline-block text-body-medium font-semibold mb-2" >{{ formatCurrency(product.price_min) }}</span>
                            </template>
                            

                            <div class="spacer w-full border-t mb-2 border-secondary-200"></div>
                            
                            <p data-match-height="product-type" class="product-type | font-body font-normal text-body-small mb-2 lowercase first-letter:capitalize ">{{ product.type }}</p>

                            <div class="metafields" data-match-height="metafields">
                            <div v-if="metafields?.metafields?.flavour" class="spacer w-full border-t mb-2 border-secondary-200"></div>

                            <p v-else data-match-height="product-flavour"></p>
                            
                            <p v-if="metafields?.metafields?.flavour" data-match-height="product-flavour" class="product-flavour | font-body font-normal lowercase first-letter:capitalize text-body-small mb-2 ">{{ metafields?.metafields?.flavour?.value }}</p>
                            </div>
                        </div>
                    </a>

                    <template v-if="(product.variants.length > 1 && !product.requires_selling_plan) || product.requires_selling_plan">
                        <div class="quick-buy-wrapper" >
                            <button @click.prevent="modal = true" :class="[buttonBackground, buttonBorderColor, buttonColor, buttonHoverBackground, buttonHoverBorderColor, buttonHoverColor]" class="btn | border w-full py-button-y px-button-x rounded-lg font-headline whitespace-nowrap text-center text-button flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed">
                                Quick Add
                                <!-- data-match-height="price" -->
                            </button>
                        </div>

                        <Teleport to="body">
                            <div :class="[modal ? 'max-h-[800px] lg:right-0' : 'max-h-0 lg:-right-[401px]']"
                                class="quick-buy-modal | fixed bottom-0 left-0 w-full overflow-hidden z-[49] | lg:max-w-[400px] lg:w-full lg:max-h-screen lg:h-full lg:left-auto lg:pt-site-header-height-lg | duration-animation-speed transition-all">
                                <div @click.prevent="modal = false" :class="[modal ? 'lg:max-w-[100vw] lg:max-h-[100vh]' : 'lg:max-w-0 max-h-0']"
                                    class="overlay | fixed bottom-0 max-w-[100vw] right-0 h-screen w-screen lg:max-h-[100vh] bg-black/25 cursor-pointer -z-10 | transition-all duration-animation-speed">
                                    </div>
                                <div class="modal-inner | h-full py-6 z-10 rounded-tl-2xl rounded-tr-2xl | lg:rounded-tr-none lg:rounded-bl-2xl lg:relative" :class="[modalBackground, modalColor]">
                                    <a
                                        @click.prevent="modal = false"
                                        class="close-icon absolute right-4 top-4 z-[9999]"
                                        href="#">
                                        <i class="ri-close-circle-line text-headline-3">
                                            
                                        </i>
                                    </a>

                                    <!--variant data-->

                                    <div class="ecommerce-options | overflow-auto max-h-[calc(100vh_-_var(--site-header-height-announcement)_-_48px)] | lg:h-full lg:max-h-full">
                                        <form method="post" action="/cart/add" :id="product.id" accept-charset="UTF-8" class=" | h-full flex flex-col justify-between" enctype="multipart/form-data">

                                            <div class="options-wrapper mt-6">
                                            <a :href="productUrl">

                                                <p  class="title | px-4 font-headline text-headline-1 uppercase mb-2 | lg:text-headline-1-lg lg:px-6">{{ product.title }}</p>

                                                <div class="desc | px-4 text-body-large mb-2 | lg:text-body-large-lg lg:px-6" v-html="product.description"></div>

                                                <div class="product_rating_wrapper | px-4 | lg:px-6">

                                                    <a href="#shopify-product-reviews" class="reviews ani-scroll"><span class="shopify-product-reviews-badge" :data-id="product.id"></span></a>
                                        
                                                </div>

                                            </a>

                                            <div class="form-controls">
                                                <div class="hidden">
                                                    <input type="hidden" name="properties[_tags]" :value="product.tags.join(',')" data-property>
                                                    <input v-if="selectedVariant" type="hidden" name="id" :value="selectedVariant.id" data-property>
                                                    <input type="hidden" name="subscription" :value="subToggle" >
                                                </div>
                                            </div>

                                            <div v-if="product.options.length > 0 && product.variants[0].option1 != 'Default Title'" class="flex flex-wrap mb-4 px-4 | lg:px-6">
                                                
                                                
                                                <div v-for="(option, i) in product.options" class="relative w-full" :key="option.name" :class="[modalBackground, modalColor, modalBorderColor, 'z-'+(3 - i)*10]">
                                                
                                                    <div class="selector-wrapper !mt-4 transition-all accordion-content-wrapper opacity-0" :class="groupedOptions[1][groupedOptions[1].length -1 ] != selectedOptions[1] && option.toLowerCase() =='machine' ? '' : '!opacity-100 expanded'">

                                                        <label class="font-semibold mb-2 gap-1">{{ option }}
                                                            <span class="inline-block cursor-pointer relative group">
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <g id="remix-icons/line/system/information-line" clip-path="url(#clip0_1317_1060)">
                                                                            <g id="Group">
                                                                                <path id="Vector" d="M8.00004 14.6667C4.31804 14.6667 1.33337 11.682 1.33337 8C1.33337 4.318 4.31804 1.33333 8.00004 1.33333C11.682 1.33333 14.6667 4.318 14.6667 8C14.6667 11.682 11.682 14.6667 8.00004 14.6667ZM8.00004 13.3333C9.41453 13.3333 10.7711 12.7714 11.7713 11.7712C12.7715 10.771 13.3334 9.41448 13.3334 8C13.3334 6.58551 12.7715 5.22895 11.7713 4.22876C10.7711 3.22856 9.41453 2.66666 8.00004 2.66666C6.58555 2.66666 5.229 3.22856 4.2288 4.22876C3.22861 5.22895 2.66671 6.58551 2.66671 8C2.66671 9.41448 3.22861 10.771 4.2288 11.7712C5.229 12.7714 6.58555 13.3333 8.00004 13.3333ZM7.33337 4.66666H8.66671V6H7.33337V4.66666ZM7.33337 7.33333H8.66671V11.3333H7.33337V7.33333Z" fill="#30261A"/>
                                                                            </g>
                                                                        </g>
                                                                        <defs>
                                                                            <clipPath id="clip0_1317_1060">
                                                                                <rect width="16" height="16" fill="white"/>
                                                                            </clipPath>
                                                                        </defs>
                                                                    </svg>
                                                                    <div class="info-panel test-panel | absolute p-4 z-[60] top-0 left-4 pointer-events-none text-body-small min-w-[120px] text-center rounded-lg font-body transition-all opacity-0 scale-75 bg-secondary-900 text-tertiary-900 | group-hover:block group-hover:opacity-100 group-hover:scale-100">                                                   
                                                                    <template v-if="metafields?.metafields && Object.keys(metafields.metafields).length > 0" v-for="metafield in metafields.metafields.option_explanations?.value">
                                                                        <template v-if="metafield.option_type == option.toLowerCase()">
                                                                            {{ metafield.tool_tip.children[0].children[0].value }}
                                                                        </template>
                                                                    </template>
                                                                </div>
                                                            </span>
                                                        </label>

                                                        <div v-if="option == 'size' || option == 'Size'" class="single-option-selector">
                                                            <div v-for="(groupedOption, index) in groupedOptions[i]" :key="groupedOption" class="flex-grow">
                                                                <input type="radio" :name="'product-selector-'+product.id" :id="'product-selector-'+product.id+'-'+index" :value="groupedOption" v-model="selectedOptions[i]">
                                                                <label :for="'product-selector-'+product.id+'-'+index" class="rounded justify-center " :class="{disabled: !optionIsAvailable(i, groupedOption) }">{{ groupedOption }}</label>
                                                            </div>
                                                        </div>
                                                        <template v-else class="border border-secondary-900">
                                                            
                                                            <styleable-dropdown :default-to-first-option="false" label-classes="font-headline text-body-medium" v-model="selectedOptions[i]" >
                                                                <option v-for="groupedOption in groupedOptions[i]" :value="groupedOption" class="font-headline" :key="groupedOption">{{ groupedOption }}</option>
                                                            </styleable-dropdown>

                                                        </template>
                                                    </div>

                                                </div>

                                                <!-- <template v-if="groupedOptions[1]?.length && metafields.metafields?.machine_options?.value?.length > 0">
                                                    <div class="relative w-full rounded border-secondary-900 bg-neutral-900">
                                                        <div class="selector-wrapper !mt-4 transition-all accordion-content-wrapper" :class="groupedOptions[1][groupedOptions[1].length -1 ] != selectedOptions[1] ? 'opacity-0' : 'opacity-100 expanded' ">

                                                            <label class="mb-2 gap-1 font-semibold text-secondary-900"> Machine: 
                                                                <span class="inline-block cursor-pointer relative group">
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <g id="remix-icons/line/system/information-line" clip-path="url(#clip0_1317_1060)">
                                                                            <g id="Group">
                                                                                <path id="Vector" d="M8.00004 14.6667C4.31804 14.6667 1.33337 11.682 1.33337 8C1.33337 4.318 4.31804 1.33333 8.00004 1.33333C11.682 1.33333 14.6667 4.318 14.6667 8C14.6667 11.682 11.682 14.6667 8.00004 14.6667ZM8.00004 13.3333C9.41453 13.3333 10.7711 12.7714 11.7713 11.7712C12.7715 10.771 13.3334 9.41448 13.3334 8C13.3334 6.58551 12.7715 5.22895 11.7713 4.22876C10.7711 3.22856 9.41453 2.66666 8.00004 2.66666C6.58555 2.66666 5.229 3.22856 4.2288 4.22876C3.22861 5.22895 2.66671 6.58551 2.66671 8C2.66671 9.41448 3.22861 10.771 4.2288 11.7712C5.229 12.7714 6.58555 13.3333 8.00004 13.3333ZM7.33337 4.66666H8.66671V6H7.33337V4.66666ZM7.33337 7.33333H8.66671V11.3333H7.33337V7.33333Z" fill="#30261A"/>
                                                                            </g>
                                                                        </g>
                                                                        <defs>
                                                                            <clipPath id="clip0_1317_1060">
                                                                                <rect width="16" height="16" fill="white"/>
                                                                            </clipPath>
                                                                        </defs>
                                                                    </svg>
                                                                    <div class="info-panel | absolute p-4 z-[60] top-0 left-4 pointer-events-none text-body-large text-initial w-[clamp(120px,250px,35vw)] normal-case font-normal rounded-lg font-body transition-all opacity-0 scale-75 bg-tertiary-900 text-secondary-900 | group-hover:block group-hover:opacity-100 group-hover:scale-100">                                                   
                                                                        <template v-if="metafields?.metafields && Object.keys(metafields.metafields).length > 0" v-for="metafield in metafields.metafields.option_explanations?.value">
                                                                            <template v-if="metafield.option_type == 'machine' ">
                                                                                {{ metafield.tool_tip.children[0].children[0].value }}
                                                                            </template>
                                                                        </template>
                                                                    </div>
                                                                </span>
                                                            </label>

                                                            <styleable-dropdown  label-classes="font-headline" name="properties[machine_option]">
                                                                <option v-for="machineOption in metafields.metafields.machine_options.value" :value="machineOption.option" :key="machineOption.option" class="font-headline">{{ machineOption.option }}</option>
                                                            </styleable-dropdown>

                                                        </div>
                                                    </div>
                                                </template> -->

                                            </div>
                                            
                                            <template v-if="product.selling_plan_groups?.length > 0 && !product.requires_selling_plan && !excludedVariant">
                                                <div class="purchase-type | border bg-neutral-900 text-secondary-900 mt-4 border-secondary-900 mb-2 mx-4 rounded-lg | lg:mx-6" :class="[modalBorderColor]">
                                                    <a @click.prevent="subToggle = false" href="#" class="flex relative rounded-lg items-center py-3 px-4 text-body-medium | lg:text-body-medium-lg | before:h-4 before:w-4 before:content-[''] before:rounded-lg before:border  before:block before:mr-2 before:transition-all before:duration-animation-speed | after:h-2 after:w-2 after:block after:absolute after:left-5 after:rounded-lg after:content-['']  after:transition-all after:duration-animation-speed" :class="[subToggle ? 'before:border-secondary-400' : 'active before: border-secondary-900 text-neutral-900 after:bg-neutral-900 bg-secondary-900']">{{ oneTime }}</a>
                                                </div>
                                            </template>
                                            <template v-if="product.selling_plan_groups?.length > 0 && product.selling_plan_groups[0].selling_plans && !excludedVariant">
                                                <div class="purchase-type | border bg-neutral-900 text-secondary-900 mt-4 border-secondary-900 mx-4 rounded-lg | lg:mx-6" :class="[modalBorderColor]">
                                                    <template v-if="product.selling_plan_groups?.length > 0 && !product.requires_selling_plan">
                                                    <a @click.prevent="subToggle = true" href="#" class="flex relative items-center py-3 px-4 text-body-medium | lg:text-body-medium-lg | before:h-4 before:w-4 before:content-[''] before:rounded-lg before:border before:block before:mr-2 before:transition-all before:duration-animation-speed | after:h-2 after:w-2 after:block after:absolute after:left-5 after:rounded-lg after:content-[''] after:transition-all after:duration-animation-speed" :class="[subToggle ? 'active border-secondary-900 after:bg-neutral-900 bg-secondary-900 text-neutral-900 rounded-bl-none rounded-br-none rounded-tr-lg rounded-tl-lg' : 'before:border-secondary-400 rounded ']">
                                                        {{ subscription }}
                                                        <template v-if="product.selling_plan_groups[0]?.selling_plans[0]">
                                                            <template v-if="product.selling_plan_groups[0].selling_plans[0].price_adjustments[0].value_type == 'percentage'">
                                                                {{ product.selling_plan_groups[0].selling_plans[0].price_adjustments[0].value }}%
                                                            </template>
                                                            <template v-if="product.selling_plan_groups[0].selling_plans[0].price_adjustments[0].value_type == 'value'">
                                                                £ {{ formatCurrency(selling_plan.price_adjustments[0].value) }} 
                                                            </template>
                                                        </template>
                                                    </a>
                                                    </template>
                                                    <div :data-frequency-selector="product.id" class="subscription-wrapper selector-wrapper expanded | !mt-0 w-full !bg-secondary-900 !text-neutral-900 border-neutral-900 rounded-br-lg rounded-bl-lg p-4 pt-0" :class="[(subToggle || product.requires_selling_plan)  ? 'block expanded' : 'hidden']">

                                                        <styleable-dropdown name="properties[selling_plan]">
                                                            <!-- <option value="">{{productCardContent.no_subscription}}</option> -->
                                                            <template v-for="selling_group in product.selling_plan_groups">
                                                                <option v-for="selling_plan in selling_group.selling_plans" :value="selling_plan.id" :key="selling_plan.id">
                                                                    {{ selling_plan.name }} 
                                                                    <!-- <template v-if="selling_plan.price_adjustments[0]">
                                                                        - <template v-if="selling_plan.price_adjustments[0].value_type == 'percentage'">
                                                                            {{ selling_plan.price_adjustments[0].value }}% discount
                                                                        </template>
                                                                        <template v-if="selling_plan.price_adjustments[0].value_type == 'value'">
                                                                            {{ formatCurrency(selling_plan.price_adjustments[0].value) }}% discount
                                                                        </template>
                                                
                                                                    </template> -->
                                                                </option>
                                                            </template>
                                                        </styleable-dropdown>
                
                                                        <div v-if="subscriptionKeyPoints" class="sub-benefits | mt-2" v-html="subscriptionKeyPoints"></div>
                                                    </div>
                                                </div>
                                            </template>

                                            

                                        </div>
                                        <div class="flex-grid" :class="[modalBackground, modalColor, modalBorderColor]">
                                                
                                                <template v-if="product.available">
                                                    <div class="qty-wrapper w-full border-t border-neutral-0/25 pt-2 mt-4 px-4 | lg:px-6">
                                                        <label class="w-full uppercase text-body-small font-semibold block mb-1">Quantity</label>
                                                        <div class="flex">
                                                            <a href="#" class="decrement qty-btn | py-2 px-4 border border-secondary-900 rounded" :class="[modalBorderColor]" @click.prevent="decrement">
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g id="remix-icons/fill/system/subtract-fill" clip-path="url(#clip0_1108_24449)">
                                                                    <g id="Group">
                                                                    <path id="Vector" d="M5 11H19V13H5V11Z" fill="#30261A"/>
                                                                    </g>
                                                                    </g>
                                                                    <defs>
                                                                    <clipPath id="clip0_1108_24449">
                                                                    <rect width="24" height="24" fill="white"/>
                                                                    </clipPath>
                                                                    </defs>
                                                                </svg>
                                                            </a>
                                                            <input class="mx-4 border bg-transparent-500 w-full text-center text-body-large outline-none border-secondary-900 rounded" :class="[modalBorderColor]" name="quantity" type="number" data-qty-selector v-model="quantity">
                                                            <a href="#" class="increment qty-btn | py-2 px-4 border border-secondary-900 rounded" :class="[modalBorderColor]" @click.prevent="increment">
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g id="remix-icons/line/system/add-line" clip-path="url(#clip0_1108_24455)">
                                                                    <g id="Group">
                                                                    <path id="Vector" d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="#30261A"/>
                                                                    </g>
                                                                    </g>
                                                                    <defs>
                                                                    <clipPath id="clip0_1108_24455">
                                                                    <rect width="24" height="24" fill="white"/>
                                                                    </clipPath>
                                                                    </defs>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    
                                                    <template v-if="!selectedVariant">
                                                        <button disabled class="btn | border w-full py-button-y px-button-x rounded-lg text-center text-button flex items-center justify-center relative cursor-pointer | lg:text-button-lg bg-primary-500 text-neutral-0 | transition-all duration-animation-speed | disabled">Not available</button>
                                                    </template>
                                                    <template v-else-if="selectedVariant.available">
                                                        <div :class="{'w-full border-t border-neutral-0/25 pt-6 px-4 mt-6 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.10)] | lg:px-6': (product.selling_plan_groups?.length > 0 || !product.requires_selling_plan)}">
                                                            <button data-cart-add-async :class="[buttonBackground, buttonBorderColor, buttonColor, buttonHoverBackground, buttonHoverBorderColor, buttonHoverColor]" class="btn | border w-full py-button-y px-button-x font-headline rounded-lg text-center text-button flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed">
                                                                {{ buyNow }} 
                                                                <template v-if="selectedVariant">
                                                                    <p v-if="selectedVariant.compare_at_price > selectedVariant.price" class="price mb-4 pointer-events-none">
                                                                        <del class="opacity-25 pointer-events-none">{{ formatCurrency(selectedVariant.compare_at_price) }}</del> {{ formatCurrency(selectedVariant.price) }}
                                                                    </p>
                                                                    <template v-else>
                                                                        <p v-if="subToggle && product.selling_plan_groups[0].selling_plans[0].price_adjustments[0].value && !excludedVariant" class="price | text-body-large | lg:text-body-large-lg pointer-events-none">&nbsp {{ formatCurrency(selectedVariant.price * (100 - product.selling_plan_groups[0].selling_plans[0].price_adjustments[0].value) / 100 )  }}</p>
                                                                        <p v-else class="price | ml-1 pointer-events-none"> <span class="mr-1 pointer-events-none">-</span> {{ formatCurrency(selectedVariant.price) }}</p>
                                                                    </template>
                                                                </template>
                                                            </button>
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <div class="w-full border-t border-neutral-0/25 pt-6 px-4 mt-6 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.10)] | lg:px-6 ">
                                                            <button disabled :class="[buttonBackground, buttonBorderColor, buttonColor, buttonHoverBackground, buttonHoverBorderColor, buttonHoverColor]" class="btn | border w-full py-button-y px-button-x rounded-lg text-center text-button opacity-75 flex items-center justify-center relative cursor-pointer | lg:text-button-lg  | transition-all duration-animation-speed | disabled">Sold Out</button>
                                                        </div>
                                                    </template>
                                                    
                                                    
                                                    <!-- <template v-if="additionalCheckout">
                                                            <p class="express-msg text-center text-body-medium mt-4">Or express checkout with</p>
                                                            <div class="additional-checkout-buttons">
                                                                {{ content_for_additional_checkout_buttons }}
                                                            </div>
                                                    </template> -->

                                                    <p v-if="product.selling_plan_groups?.length > 0 || !product.requires_selling_plan" class="delivery-fee-msg | text-center mt-4 text-body-small px-4">
                                                        {{ productCardContent?.free_delivery_override ? productCardContent?.free_delivery_override : productCardContent?.free_shipping_threshold > 0 ? productCardContent?.free_delivery + ' £' + productCardContent?.free_shipping_threshold : ''}} 
                                                    </p>

                                                </template>
                                                
                                                <template v-else>

                                                    <div class="w-full border-t border-neutral-0/25 pt-4 px-4 mt-4 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.10)] | lg:px-6">
                                                        <button disabled :class="[buttonBackground, buttonBorderColor, buttonColor, buttonHoverBackground, buttonHoverBorderColor, buttonHoverColor]" class="btn | border w-full py-button-y px-button-x rounded-lg text-center text-button opacity-75 flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed | disabled">Sold Out</button>
                                                    </div>

                                                </template>

                                            </div>
                                        </form>

                                    </div>

                                </div>
                            
                            </div>

                        </Teleport>

                    </template>

                    <template v-else>

                    <form method="post" action="/cart/add" :id="product.id" accept-charset="UTF-8" class="shopify-product-form" enctype="multipart/form-data">
                        <div class="form-controls">
                            <div class="hidden">
                                <input type="hidden" name="properties[_tags]" :value="product.tags.join(',')" data-property>
                                <input v-if="selectedVariant" type="hidden" name="id" :value="selectedVariant.id" data-property>
                                <input type="hidden" name="quantity" data-qty-selector v-model="quantity">
                            </div>
                        </div>

                        <!--variant data-->

                        <template v-if="!selectedVariant">
                            <button disabled :class="[buttonBackground, buttonBorderColor, buttonColor, buttonHoverBackground, buttonHoverBorderColor, buttonHoverColor]" class="btn | border w-full py-button-y px-button-x rounded-lg text-center font-headline text-button flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed | disabled">Not available</button>
                        </template>
                        <template v-else-if="selectedVariant.available">
                            <button type="submit" data-cart-add-async :class="[buttonBackground, buttonBorderColor, buttonColor, buttonHoverBackground, buttonHoverBorderColor, buttonHoverColor]" class="btn | border w-full whitespace-nowrap py-button-y px-button-x rounded-lg text-center font-headline text-button flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed">
                                Quick Add
                            </button>
                        </template>
                        <template v-else>
                            <button disabled :class="[buttonBackground, buttonBorderColor, buttonColor, buttonHoverBackground, buttonHoverBorderColor, buttonHoverColor]" class="btn | border w-full py-button-y px-button-x rounded-lg text-center font-headline text-button flex items-center justify-center relative cursor-pointer | lg:text-button-lg | transition-all duration-animation-speed | disabled">Sold Out</button>
                        </template>

                    </form>

                    </template>


                </div>

            </div>

        </template>

    </slot>

</template>

<script>
    import { computed, onBeforeMount, onMounted, onUpdated, reactive, ref } from 'vue';
    
    export default {
        name:"Product Card",
        props: {
            productObject:{
                type: Object,
                default: null
            },
            metafieldObject:{
                type: Object,
                default: null
            },
            colours:{
                type: Object,
                default: null
            },
            content:{
                type: Object,
                default: null
            },
            fullWidth: {
                type: Boolean,
                default: false
            },
            fullHeight: {
                type: Boolean,
                default: false
            },
            background: {
                type: String,
                default:productCardColors.bg_color
            },

            color: {
                type: String,
                default:productCardColors.text_color
            },

            buttonBackground: {
                type: String,
                default:productCardColors.btn_color

            },
            buttonColor: {
                type: String,
                default:productCardColors.btn_text_color

            },
            buttonBorderColor: {
                type: String,
                default:productCardColors.btn_border_color

            }
            ,
            buttonHoverBackground: {
                type: String,
                default:productCardColors.btn_hover_color

            }
            ,
            buttonHoverColor: {
                type: String,
                default:productCardColors.btn_hover_text_color

            }
            ,
            buttonHoverBorderColor: {
                type: String,
                default:productCardColors.btn_hover_border_color

            }
            ,
            modalBackground: {
                type: String,
                default:productCardColors.modal_bg_color

            }
            ,
            modalColor: {
                type: String,
                default:productCardColors.modal_text_color

            }
            ,
            modalBorderColor: {
                type: String,
                default:productCardColors.modal_border_color

            },
            buyNow: {
                type: String,
                default:productCardContent.buy_now

            },
            quickBuy: {
                type: String,
                default:productCardContent.quick_buy

            },
            oneTime: {
                type: String,
                default:productCardContent.one_time

            },
            subscription: {
                type: String,
                default:productCardContent.subscription

            },
            noSubscription: {
                type: String,
                default:productCardContent.no_subscription

            },
            subscriptionKeyPoints: {
                type: String,
                default:productCardContent.subscription_key_points

            }
            
            
        },
        setup(props) {

            const modal = ref(false)
            const subToggle = ref(false)
            const loading = ref(false)
            const product = reactive(props.productObject)
            const metafields = reactive(props.metafieldObject)
            const productUrl = ref(props.metafieldObject?.url)
            const quantity = ref(1);
            // const selectedMachine = ref(props.metafieldObject.metafields.machine_options.value[0].option);


            const selectedOptions = reactive({ ...product.variants[0].options })
            // console.log("Metafields: ",metafields);
            // console.log("Product: ",product);
            const selectedVariant = computed(() => {
                return product.variants.find((variant) => {
                    return variant.options.reduce((output, option, key) => {
                        return typeof selectedOptions[key] != 'undefined' && option == selectedOptions[key] && output
                    }, true)
                })
            })

            const selectedVariantMetafields = computed(() => {
                return metafields.variant_metafields.find(x => x.id == selectedVariant.value.id)
            })

            const groupedOptions = computed(() => {
                let optionsArr = {
                    0: [],
                    1: [],
                    2: [],
                };
                product.variants.forEach((variant) => {
                    variant.options.forEach((option, index) => {
                        if (!optionsArr[index].includes(option)) {
                            optionsArr[index].push(option);
                        }
                    })
                })
                return optionsArr;
            })

            const excludedVariant = computed(()=>{
                // console.log(window.productCardContent.variant_exclusion_list);
                // console.log('selectedVariant:', selectedVariant);
                if(window.productCardContent != undefined && selectedVariant.value.name != undefined){
                    return window.productCardContent?.variant_exclusion_list.some(variant => selectedVariant.value.name.toLowerCase().includes(variant))
                }
                else{
                    return false;
                }
            }) 

            const subPrice = computed(()=>{
                let price = selectedVariant.value.price ;
                // console.log("PRICE:",price) 
                // console.log("PRODUCT: ", product)
                if(props.product.selling_plan_groups[0].selling_plans[0].price_adjustments[0].value != "undefined"){
                    return ( 100 - props.product.selling_plan_groups[0].selling_plans[0].price_adjustments[0].value ) / 100 * price; 
                }
                else{
                    return price
                }
                
            })

            function optionIsAvailable(index, option) {

                // console.log(index, option, selectedOptions)

                let adjustedSelectedOptions = Object.assign([], selectedOptions)
                
                adjustedSelectedOptions[index] = option

                let output = product.variants.some((variant) => {
                    return variant.available && variant.options.reduce((output, option, key) => {
                        return typeof adjustedSelectedOptions[key] != 'undefined' && option == adjustedSelectedOptions[key] && output
                    }, true)
                })

                // console.log(output)

                return output
            }
            

            function formatCurrency(value) {
                return new Intl.NumberFormat(window.locale ?? 'en-GB', { style: 'currency', currency: window.currency ?? 'GBP', minimumFractionDigits: 2}).format(value / (10 ** (window.currencyDecimals ?? 2)))
            }

            function increment() {
                quantity.value++;
            }

            function decrement() {
                if (quantity.value > 0) {
                    quantity.value--;
                }
            }

            function subState(state) {
                subToggle.value = state
            }

            // function tagManipulator(product, tag, prepend, append) {
            //     var output = '';
            //     for (var i = 0; i < product.tags.length; i++) {
            //         if(product.tags[i].indexOf(tag) != -1) {
            //             output = product.tags[i].replace(tag, prepend).concat('', append);
            //             break;
            //         }
            //     };
            //     return output
            // }

            //IOS Safari related logic
            function touchStartHandler(e){
                // console.log(e.currentTarget);
                // console.log("lifestyleImage",e.currentTarget.querySelector('[data-lifestyle-img]'));
                // e.currentTarget.querySelector('[data-lifestyle-img]').classList.add('!opacity-100');
                // e.currentTarget.classList.add('!opacity-100');
                e.target.closest('[data-product-card]').querySelector('[data-lifestyle-img]').classList.add('!opacity-100');
            }
            function touchEndHandler(e){
                // e.currentTarget.querySelector('[data-lifestyle-img]').classList.remove('!opacity-100');
                // e.currentTarget.classList.remove('!opacity-100');
                e.target.closest('[data-product-card]').querySelector('[data-lifestyle-img]').classList.remove('!opacity-100');
            }

            function clickHandler(e){
                // need to add viewport logic so this would only apply for mobile
                e.target.closest('[data-product-card]').querySelector('[data-lifestyle-img]').classList.add('!opacity-100');
            }

            return {
                
                // lazyLoading,
                product,
                productUrl,
                metafields,
                selectedOptions,
                selectedVariant,
                selectedVariantMetafields,
                excludedVariant,
                // selectedMachine,  
                groupedOptions,
                quantity,
                modal,
                subToggle,
                subPrice,
                touchStartHandler,
                touchEndHandler,
                
                loading,
                // tagManipulator,
                optionIsAvailable,
                formatCurrency,
                increment,
                decrement,
                subState
            }
        }
    }
</script>