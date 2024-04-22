import { createApp } from 'vue';
import ProductCard from './components/ProductCard';
// import ProductCollection from './components/ProductCollection';
// import CollectionFilters from './components/CollectionFilters';
import StyleableDropdown from './components/StyleableDropdown'
// import Paginator from './components/Paginator'
import ArticleCard from './components/ArticleCard';

window.buildApp = function(id) {
    const app = createApp({
        name: 'Global-app' + id,
    });

    app.config.globalProperties.productCardColors = window.productCardColors;
    app.config.globalProperties.productCardContent = window.productCardContent;

    app.config.compilerOptions.delimiters = ['${', '}'];

    app.component('product-card', ProductCard)
    // app.component('collection-filters', CollectionFilters)
    app.component('styleable-dropdown', StyleableDropdown)
    // app.component('product-collection', ProductCollection)
    // app.component('paginator', Paginator)
    app.component('article-card', ArticleCard);

    app.mount(`#${id}`);

    app.config.devtools = false

    return app

}

