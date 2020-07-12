<template>
    <main>
        <form class="container">
            <div id="input-with-icon">
                <img src="@/assets/search.svg" class="icon">
                <input type="text" v-model="keyword" @keydown.enter="inputKeyword">
            </div>

            <div id="tags-area">
                <button id="before-icon-wrapper" @click="prevScroll" type="button">
                    <span id="before-icon"></span>
                </button>

                <div id="tags" ref="tags" v-dragscroll:nochilddrag>
                    <a v-for="tag of getSelectTags" :key="tag.id" class="tag select" @click="clickTag(tag)">{{ tag.name
                        }}({{tag.post_count}})</a>
                    <template v-for="tag of getTags">
                        <a class="tag" @click="clickTag(tag)" v-if="!getSelectTags.includes(tag)" :key="tag.id">{{
                            tag.name
                            }}({{tag.post_count}})</a>
                    </template>
                </div>

                <button id="next-icon-wrapper" @click="nextScroll" type="button">
                    <span id="next-icon"></span>
                </button>
            </div>
        </form>
        <hr>
        <section class="container" id="main">
            <div v-if="!postResult" class="loader" id="loading"></div>
            <div id="posts" v-else>
                <h1>{{ postResult.count }}件の検索結果</h1>
                <router-link :to="{name: 'detail', params: {id: post.id}}" v-for="post of postResult.post_list"
                             :key="post.id" class="post">
                    <article>
                        <h2 class="title">{{ post.title }}</h2>
                        <p class="description">{{ post.description }}</p>
                        <span class="tag" v-for="tag of post.tags" :key="tag.id">{{ tag.name }}</span>
                    </article>
                </router-link>

                <nav id="page" :key="getKey">
                    <ul>
                        <li v-for="i of postResult.total_pages" :key="i">
                            <span v-if="i === postResult.current_page">{{ i }}</span>
                            <router-link v-else :to="getPageURL(i)">{{ i }}</router-link>
                        </li>
                    </ul>
                </nav>
            </div>
            <Adsense v-if="hasAd" :data-ad-client="adClient" :data-ad-slot="adSlot" id="ad"></Adsense>
        </section>
    </main>


</template>

<script>
    import {UPDATE_KEYWORD, TOGGLE_SELECT_TAG} from "../store/mutation-types";
    import {mapGetters, mapActions} from 'vuex'
    import {dragscroll} from 'vue-dragscroll'

    export default {
        name: 'post-list',
        directives: {
            dragscroll
        },
        data() {
            return {
                postResult: null,
            }
        },
        watch: {
            '$route'() {
                this.postResult = null
                this.getPosts()
            },
        },
        created() {
            this.getPosts()
        },
        mounted() {
            document.title = `${process.env.VUE_APP_SITE_TOP_PAGE_NAME} - ${process.env.VUE_APP_SITE_TITLE}`
            document.querySelector('meta[name="description"]').setAttribute('content', process.env.VUE_APP_SITE_TOP_PAGE_DESCRIPTION)
        },
        computed: {
            ...mapGetters([
                'getTags', 'getSelectTags', 'getSelectTagIds', 'getKeyWord',
            ]),
            keyword: {
                get() {
                    return this.getKeyWord
                },
                set(value) {
                    this[UPDATE_KEYWORD](value)
                },
            },
            getKey() {
                return `${this.$route.query.page} ${this.$route.query.keyword} ${this.$route.query.tag}`
            },
            hasAd() {
                return process.env.VUE_APP_ADS_CLIENT && process.env.VUE_APP_ADS_SLOT
            },
            adClient() {
                return process.env.VUE_APP_ADS_CLIENT
            },
            adSlot() {
                return process.env.VUE_APP_ADS_SLOT
            }
        },
        methods: {
            ...mapActions([UPDATE_KEYWORD, TOGGLE_SELECT_TAG]),
            prevScroll() {
                const target = this.$refs.tags
                const currentPos = target.scrollLeft
                target.scrollTo({
                    left: currentPos - 400,
                    behavior: 'smooth'
                })
            },
            nextScroll() {
                const target = this.$refs.tags
                const currentPos = target.scrollLeft
                target.scrollTo({
                    left: currentPos + 400,
                    behavior: 'smooth'
                })
            },
            clickTag(tag) {
                this[TOGGLE_SELECT_TAG](tag)
                this.$refs.tags.scrollTo({left: 0})
                this.$router.push({
                    name: 'posts',
                    query: {keyword: this.keyword, tag: this.getSelectTagIds, page: 1}
                })
            },
            inputKeyword() {
                this.$router.push({
                    name: 'posts',
                    query: {keyword: this.keyword, tag: this.getSelectTagIds, page: 1}
                })
                document.activeElement.blur()
            },
            getPageURL(page) {
                return this.$router.resolve({
                    name: 'posts',
                    query: {keyword: this.keyword, tag: this.getSelectTagIds, page}
                }).route.fullPath
            },
            getPosts() {
                let url = process.env.VUE_APP_API_POSTS
                if (location.search) {
                    url += location.search
                }
                this.$http(url, {credentials: "include",})
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        this.postResult = data
                    })
            },
        }
    }
</script>

<style scoped>
    /* フォーム関連 */
    #input-with-icon {
        margin: 32px 0 0 0;
        position: relative;
        width: 300px;
        height: 35px;
    }

    #input-with-icon input {
        position: absolute;
        width: 300px;
        height: 35px;
        border-radius: 4px;
        border: solid 1px #999;
        padding: 10px 10px 10px 40px;
        box-sizing: border-box;
        z-index: 1;
    }

    #input-with-icon img {
        position: absolute;
        left: 10px;
        top: 10px;
        z-index: 2;
    }

    #tags-area {
        display: grid;
        grid-template-columns: auto 1fr auto;
        column-gap: 4px;
        align-items: center;
    }

    #before-icon-wrapper {
        display: block;
        width: 20px;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        padding: 32px 0 12px 0;
    }

    #before-icon {
        display: inline-block;
        width: 4px;
        height: 4px;
        border-top: 2px solid #000;
        border-right: 2px solid #000;
        transform: rotate(-135deg);
    }

    #next-icon-wrapper {
        display: block;
        width: 20px;
        background: none;
        border: none;
        text-align: right;
        cursor: pointer;
        padding: 32px 0 12px 0;
    }

    #next-icon {
        display: inline-block;
        width: 4px;
        height: 4px;
        border-top: 2px solid #000;
        border-right: 2px solid #000;
        transform: rotate(45deg);
    }

    #tags {
        overflow-x: hidden;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        padding: 32px 0 12px 0;
    }

    #tags > .tag {
        display: inline-block;
        margin-right: 24px;
        cursor: pointer;
    }

    .select {
        color: #0000ee;
    }

    hr {
        height: 1px;
        border: none;
        background-color: #999;
    }

    #ad {
        margin-top: 32px;
    }

    h1 {
        margin-top: 12px;
        color: #999;
        font-size: 12px;
        font-weight: normal;
    }

    .tag {
        font-size: 14px;
    }

    nav#page {
        margin: 32px 0 0 0;
        text-align: center;
    }

    nav#page ul, nav#page li {
        list-style-type: none;
    }

    nav#page li {
        display: inline-block;
        font-size: 16px;
        margin-right: 16px;
    }

    nav#page a {
        text-decoration: none;
        color: #0000ee;
    }

    @media (min-width: 1024px) {
        #main {
            display: grid;
            grid-template-columns: 600px 300px;
            column-gap: 60px;
            grid-template-rows: 1fr;
        }

        #posts, #loading {
            grid-column: 1;
            grid-row: 1;
        }

        #ad {
            grid-column: 2;
            grid-row: 1;
            margin-top: 60px;
            align-self: start;
            position: sticky;
            top: 20px;
        }
    }

</style>