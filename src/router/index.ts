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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router