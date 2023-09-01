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
    component: () => import('../views/PlayOptionsView.vue')
  },
  {
    path: '/storyplayback/:storyInfoDir',
    name: 'StoryPlayBack',
    component: () => import('../views/StoryPlaybackView.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router