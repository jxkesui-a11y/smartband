const fs = require('fs');
const path = require('path');

const appVuePath = path.join(__dirname, 'src', 'App.vue');
let content = fs.readFileSync(appVuePath, 'utf8');

// 1. Remove the direct component definitions in script setup
content = content.replace(/const DashboardTab = defineAsyncComponent[^;]+;\n/g, '');
content = content.replace(/const MessagesTab = defineAsyncComponent[^;]+;\n/g, '');
content = content.replace(/const MusicTab = defineAsyncComponent[^;]+;\n/g, '');
content = content.replace(/const RosterTab = defineAsyncComponent[^;]+;\n/g, '');
content = content.replace(/const RequestsTab = defineAsyncComponent[^;]+;\n/g, '');
content = content.replace(/import { ref, computed, watch, nextTick, onMounted, onUnmounted, provide, defineAsyncComponent } from 'vue';/, "import { ref, computed, watch, nextTick, onMounted, onUnmounted, provide } from 'vue';\nimport { useRouter, useRoute } from 'vue-router';");

// 2. Replace the activeTab ref to bind to the router
content = content.replace(/const activeTab = ref\('dashboard'\);/, "const router = useRouter();\nconst route = useRoute();\nconst activeTab = computed({ get: () => route.name || 'dashboard', set: (val) => router.push({ name: val }) });");

// 3. Replace the v-if component block with router-view
const componentBlock = `        <DashboardTab v-if="activeTab === 'dashboard'" />
        <MessagesTab v-else-if="activeTab === 'messages'" />
        <MusicTab v-else-if="activeTab === 'music'" />
        <RosterTab v-else-if="activeTab === 'roster'" />
        <RequestsTab v-else-if="activeTab === 'requests'" />`;

const routerViewBlock = `        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>`;

content = content.replace(componentBlock, routerViewBlock);

fs.writeFileSync(appVuePath, content);
console.log('App.vue updated for Vue Router');
