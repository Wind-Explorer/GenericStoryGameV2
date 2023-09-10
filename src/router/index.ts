// router/index.ts
import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/playoptions',
    name: 'PlayOptions',
    component: () => import('../views/PlayerViews/PlayOptionsView.vue')
  },
  {
    path: '/createoptions',
    name: 'CreateOptions',
    component: () => import('../views/EditorViews/CreateOptionsView.vue')
  },
  {
    path: '/storyplayback/:baseDir',
    name: 'StoryPlayBack',
    component: () => import('../views/PlayerViews/StoryPlaybackView.vue'),
    props: true
  },
  {
    path: '/editoroverview/:baseDir',
    name: 'EditorOverview',
    component: () => import('../views/EditorViews/EditorOverviewView.vue'),
    props: true
  },
  {
    path: '/sceneseditor/:baseDir',
    name: 'ScenesEditor',
    component: () => import('../views/EditorViews/ScenesEditorViews/ScenesEditorView.vue'),
    props: true
  },
  {
    path: '/sceneeditor/:sceneDir',
    name: 'SceneEditor',
    component: () => import('../views/EditorViews/ScenesEditorViews/SceneEditorView.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router