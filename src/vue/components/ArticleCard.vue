<template>
    <slot
        :allArticleTags="allArticleTags"
        :lazyLoading="lazyLoading"
        :quickHoverImages="quickHoverImages"
        :hoveredCardImage="hoveredCardImage"
        :article="article"
        :toggleHoverCardImage="toggleHoverCardImage"
        :tagManipulator="tagManipulator"
        :filterTags="filterTags">
    </slot>

</template>

<script>
    import { computed, onBeforeMount, onMounted, onUpdated, reactive, ref } from 'vue';
    import useDetectBrowserFeatures from '../composition/useDetectBrowserFeatures';
    
    export default {
        name:"Article Card",
        props: {
            articleObject:{
                type: Object,
                default: null
            },
        },
        setup(props) {
            const { lazyLoading, isMobile } = useDetectBrowserFeatures();

            const loading = ref(false);
            /* 
            *  To do:
            *    - Pass this in via a prop? 
            *    - generate the data for it via a section, block data?
            */
            console.log("getting everything ready")
            console.log("ARTICLE PROP: ", props.articleObject)
            const _article = reactive(props.articleObject);
            const allArticleTags = computed(() => _article.tags);

            const quickHoverImages = ref([]);

            let hoveredCardImage = ref(false);

            function toggleHoverCardImage() {
                hoveredCardImage.value = !hoveredCardImage.value;
            }     

            console.log("Article",_article)

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
            }

            function tagManipulator(article, tag, prepend, append) {
                var output = '';
                for (var i = 0; i < article.tags.length; i++) {
                    if(article.tags[i].indexOf(tag) != -1) {
                        output = article.tags[i].replaceAll('-', '_').replace(tag, prepend).concat('', append);
                        break;
                    }
                };
                return output
            }

            function filterTags(article) {
                article.tags.filter(item => {
                    console.log(item);
                    // return item.indexOf('new') != -1
                });
            }


            return {
                allArticleTags,
                lazyLoading,
                hoveredCardImage,

                article: _article,
                quickHoverImages,
                toggleHoverCardImage,

                hoveredCardImage,
                loading,
                tagManipulator,
                filterTags
            }
        }
    }
</script>