import Vue from 'vue'
import Vuex from 'vuex'
import {UPDATE_TAGS, UPDATE_KEYWORD, TOGGLE_SELECT_TAG, UPDATE_SELECT_TAG} from "./mutation-types";

Vue.use(Vuex)

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
        tags: [],
        selectTags: [],
        keyword: '',
    },
    getters: {
        getTags(state) {
            return state.tags
        },
        getSelectTags(state) {
            return state.selectTags
        },
        getSelectTagIds(state) {
            return state.selectTags.map(tag => tag.id)
        },
        getKeyWord(state) {
            return state.keyword
        }
    },
    mutations: {
        [UPDATE_TAGS](state, payload) {
            state.tags = payload
        },
        [UPDATE_KEYWORD](state, payload) {
            state.keyword = payload
        },
        [TOGGLE_SELECT_TAG](state, payload) {
            const tagLength = state.selectTags.length
            let found = false
            for (let i = 0; i < tagLength; i++) {
                if (payload.id === state.selectTags[i].id) {
                    state.selectTags.splice(i, 1)
                    found = true
                    break
                }
            }
            if (!found) {
                state.selectTags.push(payload)
            }
        },
        [UPDATE_SELECT_TAG](state, payload) {
            state.selectTags = payload
        }
    },
    actions: {
        [UPDATE_TAGS]({commit}, payload) {
            commit(UPDATE_TAGS, payload)
        },
        [UPDATE_KEYWORD]({commit}, payload) {
            commit(UPDATE_KEYWORD, payload)
        },
        [TOGGLE_SELECT_TAG]({commit}, payload) {
            commit(TOGGLE_SELECT_TAG, payload)
        },
        [UPDATE_SELECT_TAG]({commit}, payload) {
            commit(UPDATE_SELECT_TAG, payload)
        }
    },
    modules: {}
})
