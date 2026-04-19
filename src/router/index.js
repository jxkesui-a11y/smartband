import { createRouter, createWebHashHistory } from 'vue-router'
const DashboardTab = () => import('../components/tabs/DashboardTab.vue')
const MessagesTab = () => import('../components/tabs/MessagesTab.vue')
// const MusicTab = () => import('../components/tabs/MusicTab.vue')
const RosterTab = () => import('../components/tabs/RosterTab.vue')
const RequestsTab = () => import('../components/tabs/RequestsTab.vue')

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: DashboardTab, name: 'dashboard' },
  { path: '/messages/:channel?', component: MessagesTab, name: 'messages' },
  // { path: '/music', component: MusicTab, name: 'music' },
  { path: '/roster', component: RosterTab, name: 'roster' },
  { path: '/requests', component: RequestsTab, name: 'requests', meta: { adminOnly: true } },
]

export const router = createRouter({
  history: createWebHashHistory(), // WebHashHistory avoids XAMPP Subfolder routing 404 issues
  routes
})

// Route guard: protect /requests from non-admin users
router.beforeEach((to, from, next) => {
  if (to.meta.adminOnly) {
    const user = JSON.parse(localStorage.getItem('smartband_user') || 'null')
    const allowedRoles = ['admin', 'president', 'vp']
    if (!user?.role || !allowedRoles.includes(user.role.toLowerCase())) {
      return next({ name: 'dashboard' })
    }
  }
  next()
})
