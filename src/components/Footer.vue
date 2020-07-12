<template>
    <footer>
        <div class="container">
            <p id="contact">Contact: <a :href="'mailto:'+contact">{{contact}}</a></p>
            <ul>
                <li v-for="url of urls" :key="url" v-html="url"></li>
            </ul>
            <p id="copyright">{{copyright}}</p>
        </div>
    </footer>
</template>

<script>
    export default {
        name: 'site-footer',
        computed: {
            contact() {
                return process.env.VUE_APP_CONTACT
            },
            copyright() {
                return process.env.VUE_APP_COPYRIGHT
            },
            urls() {
                return process.env.VUE_APP_URLS.split(',')
            },
        }
    }
</script>

<style scoped>
    footer {
        margin-top: 100px;
        background-color: #000;
        color: #ccc;
        padding: 24px 0;
        font-size: 14px;
    }

    footer >>> a {
        color: #ccc;
        text-decoration: none;
    }

    ul {
        margin: 12px 0;
        padding: 12px 0;
        border-top: 1px solid #999;
        border-bottom: 1px solid #999;
    }

    li {
        display: inline-block;
        margin-right: 12px;
    }
</style>