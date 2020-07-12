import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueAnalytics from 'vue-analytics'
import Adsense from 'vue-google-adsense/dist/Adsense.min.js'

Vue.config.productionTip = false
Vue.prototype.$http = (url, opts) => fetch(url, opts)

// Django CSRFの為の設定
const getCookie = name => {
    if (document.cookie && document.cookie !== '') {
        for (const cookie of document.cookie.split(';')) {
            const [key, value] = cookie.trim().split('=')
            if (key === name) {
                return decodeURIComponent(value)
            }
        }
    }
}
Vue.prototype.$csrfToken = getCookie('csrftoken')

// Googleアナリティクスの設定があれば、利用
if (process.env.VUE_APP_ANALYTICS_ID) {
    Vue.use(VueAnalytics, {
        id: process.env.VUE_APP_ANALYTICS_ID,
        router
    })
}

// Googleアドセンスの為の設定
Vue.use(require('vue-script2'))
Vue.use(Adsense)

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
