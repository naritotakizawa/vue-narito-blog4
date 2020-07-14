<template>
    <div id="app">
        <Header/>
        <router-view/>
        <Footer/>
    </div>
</template>

<script>
    import Header from './components/Header'
    import Footer from './components/Footer'
    import {mapActions, mapGetters} from 'vuex'
    import {UPDATE_TAGS, UPDATE_KEYWORD, UPDATE_SELECT_TAG} from "./store/mutation-types";

    export default {
        name: 'app',
        components: {
            Header, Footer,
        },
        computed: {
            ...mapGetters(['getTags']),
        },
        watch: {
            '$route'() {
                this.syncURLParamAndData()
            }
        },
        created() {
            // タグ一覧の取得・設定と、URLのGETパラメータをもとに検索キーワードと選択タグの設定
            this.$http(process.env.VUE_APP_API_TAGS)
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    this[UPDATE_TAGS](data)
                    this.syncURLParamAndData()
                })
        },
        methods: {
            ...mapActions([UPDATE_TAGS, UPDATE_KEYWORD, UPDATE_SELECT_TAG]),
            syncURLParamAndData() {
                this[UPDATE_KEYWORD](this.$route.query.keyword || '')

                const selectTags = []
                let tagIds = this.$route.query.tag || []
                if (tagIds && !Array.isArray(tagIds)) {
                    tagIds = [tagIds]
                }
                if (tagIds.length) {
                    const tagMap = this.getTags.reduce((result, obj) => {
                        result[obj.id] = obj;
                        return result;
                    }, {});
                    for (const tagId of tagIds) {
                        const tag = tagMap[tagId]
                        selectTags.push(tag)
                    }
                }
                this[UPDATE_SELECT_TAG](selectTags)
            },
        }
    }
</script>

<style>
    * {
        margin: 0;
        padding: 0;
    }

    body {
        font-family: source-han-sans-japanese, sans-serif;
        font-weight: normal;
        font-size: 16px;
        line-height: 1.5;
        color: #333;
    }

    a {
        text-decoration: none;
        color: #333;
    }

    .container {
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
    }

    .post {
        display: block;
        margin-top: 32px;
    }

    .post:hover {
        text-decoration: underline;
    }

    .post .title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 3px;
    }

    .post .description {
        font-size: 14px;
        margin-bottom: 3px;
    }

    .post .tag {
        font-size: 14px;
        text-decoration: underline;
        color: #999;
        margin-right: 8px;
    }


    @media (min-width: 768px) {
        .container {
            padding: 0 84px;
        }
    }

    @media (min-width: 1024px) {
        .container {
            padding: 0;
            width: 960px;
            margin: 0 auto;
        }
    }

    /* ロード中のCSS https://projects.lukehaas.me/css-loaders/ */
    .loader,
    .loader:before,
    .loader:after {
        border-radius: 50%;
        width: 2.5em;
        height: 2.5em;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
        -webkit-animation: load7 1.8s infinite ease-in-out;
        animation: load7 1.8s infinite ease-in-out;
    }

    .loader {
        color: #000000;
        font-size: 10px;
        margin: 80px auto;
        position: relative;
        text-indent: -9999em;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-animation-delay: -0.16s;
        animation-delay: -0.16s;
    }

    .loader:before,
    .loader:after {
        content: '';
        position: absolute;
        top: 0;
    }

    .loader:before {
        left: -3.5em;
        -webkit-animation-delay: -0.32s;
        animation-delay: -0.32s;
    }

    .loader:after {
        left: 3.5em;
    }

    @-webkit-keyframes load7 {
        0%,
        80%,
        100% {
            box-shadow: 0 2.5em 0 -1.3em;
        }
        40% {
            box-shadow: 0 2.5em 0 0;
        }
    }

    @keyframes load7 {
        0%,
        80%,
        100% {
            box-shadow: 0 2.5em 0 -1.3em;
        }
        40% {
            box-shadow: 0 2.5em 0 0;
        }
    }
</style>