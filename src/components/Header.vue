<template>
    <header>
        <div class="container" id="header-content">
            <h1 id="site-title"><router-link :to="{name: 'posts'}">Narito Blog</router-link></h1>
            <div class='onesignal-customlink-container' v-if="onesignal" id="onesignal"></div>
        </div>
    </header>
</template>

<script>
    export default {
        name: 'site-header',
        computed: {
            onesignal() {
                return process.env.VUE_APP_ONESIGNAL
            },
        }
    }
</script>

<style scoped>
    header {
        height: 45px;
        background-color: #282a36;
        color: #ccc;
    }

    #header-content {
        height: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
    }

    #site-title {
        font-family: myriad-pro-semiextended, sans-serif;
        font-weight: bold;
        font-size: 16px;
        grid-column: 1;
        grid-row: 1;
        align-self: center;
        justify-self: start;
    }

    #onesignal {
        grid-column: 1;
        grid-row: 1;
        align-self: center;
        justify-self: end;
    }

    a {
        color: #ccc;
        text-decoration: none;
    }


</style>