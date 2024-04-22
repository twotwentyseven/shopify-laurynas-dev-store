import { createApp } from 'vue';
import BlogListing from './components/BlogListing';
import ArticleCard from './components/ArticleCard';

const app = createApp({
	name: 'Blog Listing Root'
});

app.config.compilerOptions.delimiters = ['${', '}'];
app.component('blog-listing', BlogListing)
.component('article-card', ArticleCard);

app.mount('#vue-blog-listing');