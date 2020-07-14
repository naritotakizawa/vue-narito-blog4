<template>
    <main>
        <div v-if="!post" class="loader"></div>
        <article class="container" v-else :key="post.id">
            <header>
                <h1>{{ post.title }}</h1>
                <time>{{ getPostDateTime }}</time>
                <span class="break">|</span>
                <span class="tag" v-for="tag of post.tags" :key="tag.id">{{ tag.name }}</span>
            </header>

            <div id="post" :key="post.id">
                <aside id="side">
                    <nav id="toc" ref="toc">
                        <p id="tocTitle">目次</p>
                    </nav>
                </aside>

                <section id="post-content" class="content" ref="text" v-html="post.text_to_html">></section>

                <Adsense v-if="hasAd" :data-ad-client="adClient" :data-ad-slot="adSlot" id="ad"></Adsense>

                <section id="relations">
                    <h2 class="section-title">関連記事</h2>
                    <router-link :to="{name: 'detail', params: {id: post.id}}" v-for="post of post.relation_posts"
                                 :key="post.id" class="post">
                        <article>
                            <h2 class="title">{{ post.title }}</h2>
                            <p class="description">{{ post.description }}</p>
                            <span class="tag" v-for="tag of post.tags" :key="tag.id">{{ tag.name }}</span>
                        </article>
                    </router-link>
                </section>

                <section id="comments">
                    <h2 class="section-title">コメント一覧</h2>
                    <div class="comment" v-for="comment of this.post.comment_set" :key="comment.id">
                        <p class="comment-meta">{{getCommentDateTime(comment)}} {{comment.name}}</p>
                        <div class="content" v-html="comment.text_to_html"></div>
                        <div class="reply" v-for="reply of comment.reply_set" :key="reply.id">
                            <p class="comment-meta">{{getCommentDateTime(reply)}} {{reply.name}}</p>
                            <div class="content" v-html="reply.text_to_html"></div>
                        </div>
                        <p class="do-reply"><a @click="doReply(comment)">↑返信する</a></p>
                    </div>
                    <p class="do-comment"><a @click="doComment">新しくコメントする</a></p>

                    <transition name="modal">
                        <div class="modal-mask" v-if="form.show">
                            <div class="modal-wrapper" @click.self="closeForm">
                                <div class="modal-container">
                                    <div class="modal-body">
                                        <input type="text" v-model="form.name" placeholder="名前">
                                        <textarea v-model="form.text" placeholder="本文 マークダウンが使えます"></textarea>
                                        <button type="button" @click="send">送信</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </section>
            </div>
        </article>
    </main>
</template>

<script>
    import hljs from 'highlight.js';
    import 'highlight.js/styles/dracula.css';
    import _ from 'lodash'

    export default {
        name: 'post',
        props: {
            id: {type: Number}
        },
        data() {
            return {
                post: null,
                tocElements: [],
                form: {
                    show: false,
                    type: null,
                    target: null,
                    name: '名無し',
                    text: ''
                },
            }
        },
        watch: {
            '$route'(from, to) {
                // ページ内ではなく、関連記事クリック等での別記事への移動のときだけ
                if (from.params.id.toString() !== to.params.id.toString()) {
                    // イベントや目次欄の初期化
                    this.post = null
                    document.removeEventListener('scroll', this.delayFunc)
                    this.tocElements = []
                    this.$refs.toc.innerHTML = ''

                    // 記事取得
                    this.getPost()
                }

            },
        },
        mounted() {
            this.getPost()
        },
        computed: {
            getPostDateTime() {
                const date = new Date(this.post.updated_at)
                const week = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
                return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${week}曜日`
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
        beforeDestroy() {
            document.removeEventListener('scroll', this.delayFunc)
        },
        methods: {
            getPost() {
                this.$http(`${process.env.VUE_APP_API_POSTS}${this.id}/`, {credentials: "include",})
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        this.post = data
                        this.$nextTick(() => {
                            // nextTick後じゃないと、まだ記事テキストが描画されていない。
                            this.moveToc()
                            this.addScrollEvent()
                            setTimeout(this.highlightCode, 500)  // 重たい処理なので、少し遅らせる
                        })
                        document.title = `${data.title} - ${process.env.VUE_APP_SITE_TITLE}`
                        document.querySelector('meta[name="description"]').setAttribute('content', data.description)
                    })
            },
            getCommentDateTime(comment) {
                const date = new Date(comment.created_at)
                return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
            },
            moveToc() {
                const innerToc = this.$refs.text.querySelector('div.toc')
                const cloneToc = innerToc.cloneNode(true)
                this.$refs.toc.appendChild(cloneToc)
            },
            highlightCode() {
                for (const block of document.querySelectorAll('pre code')) {
                    hljs.highlightBlock(block);
                }
            },
            highlightToc() {
                const currentPos = window.pageYOffset
                let lastElement = null
                for (const heading of this.$refs.text.querySelectorAll('h2,h3')) {
                    const headingPos = window.pageYOffset + heading.getBoundingClientRect().top
                    if (currentPos >= headingPos) {
                        lastElement = heading
                    }
                }
                if (lastElement) {
                    for (const element of this.tocElements) {
                        if (`#${lastElement.id}` === element.hash) {
                            element.classList.add('current')
                        } else {
                            element.classList.remove('current')
                        }
                    }
                }
            },
            addScrollEvent() {
                for (const a of this.$refs.toc.querySelectorAll('div.toc a')) {
                    this.tocElements.push(a)
                }
                // _.throttle()の結果で新しい関数が返るので
                // document.removeEventListener('scroll', _.throttle(this.highlightToc, 1000))
                // みたいに解除はできない。なので、thisに格納してremoveでそれを指定する。
                this.delayFunc = _.throttle(this.highlightToc, 300)
                document.addEventListener('scroll', this.delayFunc)
            },
            doComment() {
                this.form.show = true
                this.form.type = 'comment'
                this.form.target = this.post
            },
            doReply(comment) {
                this.form.show = true
                this.form.type = 'reply'
                this.form.target = comment
            },
            closeForm() {
                this.form = {
                    show: false,
                    type: null,
                    target: null,
                    name: '名無し',
                    text: ''
                }
            },
            send() {
                let url
                if (this.form.type === 'comment') {
                    url = process.env.VUE_APP_API_COMMENTS
                } else if (this.form.type === 'reply') {
                    url = process.env.VUE_APP_API_REPLIES
                } else {
                    throw Error
                }

                const formData = new FormData();
                formData.append('target', this.form.target.id);
                formData.append('name', this.form.name);
                formData.append('text', this.form.text);
                this.$http(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': this.$csrfToken,
                    },
                }).then(response => {
                    if (response.ok) {
                        return response.json().then((data) => {
                            if (this.form.type === 'comment') {
                                this.post.comment_set.push(data)
                            } else if (this.form.type === 'reply') {
                                this.form.target.reply_set.push(data)
                            }
                            this.closeForm()

                        })
                    } else {
                        return response.json().then(data => {
                            console.log(JSON.stringify(data))
                            // this.$notify({
                            //     title: 'お知らせ',
                            //     message: this.$createElement('p', {style: 'color: #900'}, JSON.stringify(data)),
                            //     duration: 2000
                            // })
                        })
                    }
                });
            },
        }
    }
</script>

<style scoped>
    main {
        min-height: calc(100vh - 145px);
    }

    /* 記事のタイトル部分 */
    header {
        margin: 64px 0 100px 0;
    }

    header > h1 {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
    }

    header .tag {
        color: #999;
        text-decoration: underline;
        margin-right: 8px;
    }

    .break {
        margin: 0 16px;
    }

    /* 記事メインコンテンツのレイアウト設定 */
    #post {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto auto auto auto;
        row-gap: 100px;
    }

    #side {
        grid-row: 1;
    }

    #toc {
        border-left: 1px solid #999;
        padding: 20px 0 20px 20px;
        font-size: 12px;
    }

    #post-content {
        grid-row: 2;
    }

    #ad {
        grid-row: 3;
    }

    #relations {
        grid-row: 4;
    }

    #comments {
        grid-row: 5;
    }

    /* 目次 */
    #toc >>> ul {
        padding: 0;
        list-style-type: none;

    }

    #toc >>> #tocTitle {
        margin-bottom: 8px;
    }

    #toc >>> > div.toc li {
        margin-bottom: 8px;
    }

    #toc >>> > div.toc li::before {
        content: '- ';
    }

    #toc >>> a.current {
        color: #0000ee;
    }

    /* 記事本文コンテンツ */
    #post-content >>> div.toc {
        display: none;
    }

    .content >>> h2, .content >>> h3 {
        font-size: 20px;
        font-weight: bold;
        padding-bottom: 10px;
        border-bottom: 1px solid #999;
        margin-bottom: 10px;
        margin-top: 100px;
    }

    .content >>> div.toc + * {
        margin-top: 0; /* 本文内目次のつぎ、つまり実質の最初の文章は上に余白を取らない */
    }

    .content >>> p {
        line-height: 28px;
        text-align: justify;
        text-justify: inter-ideograph;
    }

    .content >>> code {
        font-family: roboto-mono, monospace;;
    }

    .content >>> img {
        max-width: 100%;
        height: auto;
    }

    .content >>> a {
        color: #0000ee;
    }

    .content >>> blockquote {
        border-left: 5px solid #999;
        padding-left: 2em;
        font-style: italic;
    }

    .content >>> > * {
        margin-bottom: 2em;
    }

    /* 関連記事やコメント欄 */
    .section-title {
        font-size: 20px;
        font-weight: bold;
        padding-bottom: 10px;
        border-bottom: 1px solid #999;
    }

    .section-title + * {
        margin-top: 10px;
    }

    .comment {
        margin-top: 32px;
    }

    .comment-meta {
        font-size: 12px;
        color: #999;
        margin-bottom: 3px;
    }

    .do-reply {
        text-align: right;
        border-bottom: 1px solid #999;
        padding-bottom: 10px;
    }

    .section-title + .do-comment {
        margin-top: 10px;
    }

    .do-comment {
        margin-top: 32px;
    }

    .do-reply > a, .do-comment > a {
        color: #0000ee;
    }

    /* モーダル */
    .modal-mask {
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: table;
        transition: opacity 0.3s ease;
    }

    .modal-wrapper {
        display: table-cell;
        vertical-align: middle;
    }

    .modal-container {
        padding: 20px 30px;
        background-color: #fff;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
        transition: all 0.3s ease;
    }

    .modal-body {
        margin: 20px 0;
    }

    /* モーダルのアニメ */
    .modal-enter {
        opacity: 0;
    }

    .modal-leave-active {
        opacity: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    }

    .modal-body input {
        width: 100%;
        height: 35px;
        border-radius: 4px;
        border: solid 1px #999;
        padding: 10px;
        box-sizing: border-box;
        margin-bottom: 10px;
    }

    .modal-body textarea {
        width: 100%;
        height: 200px;
        border-radius: 4px;
        border: solid 1px #999;
        padding: 10px;
        box-sizing: border-box;
        margin-bottom: 10px;
    }

    .modal-body button {
        width: 100%;
        height: 35px;
        border-radius: 4px;
        border: solid 1px #999;
        padding: 8px;
        box-sizing: border-box;
        margin-bottom: 10px;
        background: none;
        cursor: pointer;
    }

    @media (min-width: 768px) {
        .reply {
            margin-left: 50px;
        }

        .modal-container {
            width: 400px;
            margin: 0 auto;
        }
    }

    @media (min-width: 1024px) {
        #post {
            display: grid;
            grid-template-columns: 600px 300px;
            column-gap: 60px;
            grid-template-rows: auto auto auto;
            row-gap: 100px;
        }

        #post-content {
            grid-column: 1;
            grid-row: 1;
        }

        #side {
            grid-column: 2;
            grid-row: 1;
            display: grid;
        }

        #toc {
            margin-top: 50px;
            width: 150px;
            justify-self: right;
            align-self: start;
            position: sticky;
            top: 20px;
        }

        #relations {
            grid-column: 1;
            grid-row: 2;
        }

        #comments {
            grid-column: 1;
            grid-row: 3;
        }

        #ad {
            grid-column: 2;
            grid-row: 2 / -1;
            align-self: start;
            position: sticky;
            top: 20px;
        }

    }

</style>
