<template>
  <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />

  <div v-if="isOffline" class="bg-[#FF453A] text-white text-[10px] font-bold text-center py-1.5 fixed top-0 left-0 right-0 z-[9999] uppercase tracking-[0.2em] animate-pulse">
    <i class="fa-solid fa-wifi font-bold mr-2 opacity-50 relative after:content-['/'] after:absolute after:left-[2px] after:top-0"></i> You are offline. Viewing cached data.
  </div>

  <div v-if="isLoggedIn && !notificationPermissionDenied" class="min-h-screen bg-black p-4 md:p-6 flex gap-6 font-sans text-gray-100 overflow-hidden relative text-left" :class="isOffline ? 'pt-12' : ''">
    
    <div v-if="toast.show" class="fixed top-10 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 z-[200] px-8 py-4 rounded-2xl shadow-2xl transition-all font-bold text-sm uppercase tracking-widest animate-in slide-in-from-top-10" :class="toast.type === 'error' ? 'bg-[#FF453A] text-white' : 'bg-[#32D74B] text-black'">
      <i class="mr-2" :class="toast.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i> {{ toast.message }}
    </div>

    <div class="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(60,10,10,0.4)_0%,rgba(0,0,0,0)_60%)] pointer-events-none -z-10"></div>
    
    <div v-if="showProfileMenu || showMobileMenu" @click="closeMenus" class="fixed inset-0 z-40"></div>

    <aside class="w-64 shrink-0 bg-[#111111] rounded-[24px] p-5 flex flex-col border border-white/5 hidden md:flex shadow-2xl relative z-50">
      <div class="flex items-center gap-3 text-xl font-bold text-white mb-10 px-2 uppercase tracking-tighter">
        <i class="fa-solid fa-music text-[#F5C518]"></i> SmartBand
      </div>

      <nav class="flex flex-col gap-1.5">
        <template v-for="tab in filteredTabs" :key="tab.id">
          <div v-if="tab.id === 'messages'" class="flex flex-col gap-1">
            <button @click="handleMessagesClick" class="flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all text-left w-full relative" :class="activeTab === 'messages' ? 'bg-[#222222] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'">
              <i class="fa-regular fa-message w-5 text-center text-lg"></i><span class="flex-1">Messages</span><i class="fa-solid fa-chevron-down text-[10px] transition-transform duration-300" :class="isMessagesExpanded ? 'rotate-0' : '-rotate-90'"></i>
            </button>
            <div v-if="isMessagesExpanded" class="flex flex-col gap-1 ml-9 mt-1 overflow-hidden transition-all duration-300">
              <button v-for="ch in channels" :key="ch.id" @click="activeTab = 'messages'; selectedChannel = ch.id; showMobileMenu = false" class="flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-bold transition-all text-left uppercase tracking-widest relative" :class="selectedChannel === ch.id && activeTab === 'messages' ? 'text-[#F5C518]' : 'text-gray-500 hover:text-gray-300'">
                <i :class="ch.icon" class="opacity-50 text-[10px]"></i><span>{{ ch.name }}</span>
                <i v-if="ch.id === 'important' && unreadMessages[ch.id] > 0" class="fa-solid fa-exclamation text-[#FF453A] ml-auto text-xs animate-pulse"></i>
                <span v-else-if="unreadMessages[ch.id] > 0" class="ml-auto w-4 h-4 bg-[#FF453A] text-white text-[8px] font-bold rounded-full flex items-center justify-center">{{ unreadMessages[ch.id] }}</span>
              </button>
            </div>
          </div>
          <button v-else @click="activeTab = tab.id; showMobileMenu = false" class="flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all text-left w-full relative" :class="activeTab === tab.id ? 'bg-[#222222] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'">
            <i :class="tab.icon" class="w-5 text-center text-lg"></i><span class="flex-1">{{ tab.name }}</span>
            <span v-if="tab.id === 'requests' && pendingCount > 0" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#FF453A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">{{ pendingCount }}</span>
          </button>
        </template>
      </nav>
    </aside>

    <div v-if="showMobileMenu" class="absolute top-[85px] left-4 right-4 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-4 md:hidden animate-in slide-in-from-top-4 max-h-[60vh] overflow-y-auto">
      <nav class="flex flex-col gap-1.5">
        <template v-for="tab in filteredTabs" :key="tab.id">
          <div v-if="tab.id === 'messages'" class="flex flex-col gap-1">
            <button @click="handleMessagesClick" class="flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all text-left w-full" :class="activeTab === 'messages' ? 'bg-[#222222] text-white' : 'text-gray-400'">
              <i class="fa-regular fa-message w-5 text-center text-lg"></i><span class="flex-1">Messages</span><i class="fa-solid fa-chevron-down text-[10px]"></i>
            </button>
            <div v-if="isMessagesExpanded" class="flex flex-col gap-1 ml-9 mt-1">
              <button v-for="ch in channels" :key="ch.id" @click="activeTab = 'messages'; selectedChannel = ch.id; showMobileMenu = false" class="flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-bold text-left uppercase tracking-widest relative" :class="selectedChannel === ch.id && activeTab === 'messages' ? 'text-[#F5C518]' : 'text-gray-500'">
                <i :class="ch.icon" class="opacity-50 text-[10px]"></i><span>{{ ch.name }}</span>
                <i v-if="ch.id === 'important' && unreadMessages[ch.id] > 0" class="fa-solid fa-exclamation text-[#FF453A] ml-auto text-xs animate-pulse"></i>
                <span v-else-if="unreadMessages[ch.id] > 0" class="ml-auto w-4 h-4 bg-[#FF453A] text-white text-[8px] font-bold rounded-full flex items-center justify-center">{{ unreadMessages[ch.id] }}</span>
              </button>
            </div>
          </div>
          <button v-else @click="activeTab = tab.id; showMobileMenu = false" class="flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all text-left w-full" :class="activeTab === tab.id ? 'bg-[#222222] text-white' : 'text-gray-400'">
            <i :class="tab.icon" class="w-5 text-center text-lg"></i><span class="flex-1">{{ tab.name }}</span>
          </button>
        </template>
      </nav>
    </div>

    <main class="flex-1 bg-[#0a0a0a] rounded-[24px] border border-white/5 flex flex-col overflow-hidden relative shadow-2xl">
      <header class="relative z-50 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md">
        
        <div class="flex items-center gap-4">
          <button @click="showMobileMenu = !showMobileMenu" class="md:hidden w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white"><i class="fa-solid fa-bars"></i></button>
          <div>
            <h1 class="text-lg md:text-2xl font-bold text-white tracking-wide uppercase truncate max-w-[150px] md:max-w-none">{{ activeTab === 'messages' ? '#' + selectedChannel : activeTab }}</h1>
            <p class="text-white/60 text-[10px] md:text-sm mt-1 truncate">Tier: <span class="text-[#F5C518] font-bold capitalize">{{ currentUser?.tier }}</span> | <span class="text-white font-bold">{{ currentUser?.instrument }}</span></p>
          </div>
        </div>

        <div class="flex items-center gap-5">
          <button @click="toggleProfile" class="w-12 h-12 md:w-10 md:h-10 rounded-full bg-[#F5C518] flex items-center justify-center font-bold text-black text-sm hover:ring-4 hover:ring-white/10 transition-all cursor-pointer relative z-50">{{ userInitials }}</button>
          <div v-if="showProfileMenu" class="absolute right-4 md:right-0 mt-3 w-60 md:w-64 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col top-16 sm:max-w-[calc(100vw-2rem)]">
            <div class="p-5 bg-[#1a1a1a] border-b border-white/5"><p class="text-white font-bold leading-tight">{{ currentUser?.first_name }} {{ currentUser?.last_name }}</p><p class="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{{ currentUser?.role }} Status</p></div>
            <button @click="showMyProfileModal = true; closeMenus()" class="p-4 text-left text-sm text-white hover:bg-white/5 font-bold transition-all border-b border-white/5"><i class="fa-solid fa-user-pen mr-2"></i> Edit Profile</button>
            <button @click="handleLogout" class="p-4 text-left text-sm text-[#FF453A] hover:bg-[#FF453A]/10 font-bold transition-all cursor-pointer"><i class="fa-solid fa-right-from-bracket mr-2"></i> Log Out</button>
          </div>
        </div>
      </header>

      <div class="relative z-0 p-4 md:p-8 overflow-y-auto h-full scrollbar-hide">

        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>

      </div>
    </main>

    <EditMemberModal
      :modelValue="editingUser"
      :isSubmitting="isSubmitting"
      :availableRoles="getAvailableRoles"
      :assignedOfficerRoles="getAssignedOfficerRoles"
      :instrumentList="instrumentList"
      @save="handleSaveUser"
      @cancel="editingUser = null"
    />

    <MyProfileModal
      :show="showMyProfileModal"
      :form="myProfileForm"
      :instrumentList="instrumentList"
      @update="updateMyProfile"
      @cancel="showMyProfileModal = false"
    />

    <AddPostModal
      :show="showAddPostModal"
      :isSubmitting="isSubmitting"
      @submit="submitPost"
      @cancel="showAddPostModal = false"
    />

    <AddEventModal
      :show="showAddEventModal"
      :isSubmitting="isSubmitting"
      @submit="submitEvent"
      @cancel="showAddEventModal = false"
    />

  </div>

  <!-- Notification Permission Modal -->
  <div v-if="showNotificationPermissionModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
    <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-8 md:p-10 shadow-3xl text-center">
      <div class="text-5xl mb-6"><i class="fa-solid fa-bell text-[#F5C518]"></i></div>
      <h3 class="text-2xl font-bold text-white mb-3">Enable Notifications</h3>
      <p class="text-sm text-gray-400 mb-8 leading-relaxed">We need your permission to send you important announcements and urgent alerts from officers. This keeps you informed about critical updates.</p>
      <div class="flex gap-3 flex-col">
        <button @click="askNotificationPermission" class="w-full bg-[#F5C518] text-black px-6 py-4 rounded-[20px] font-bold text-sm uppercase tracking-widest hover:bg-[#d4a914] transition-all min-h-[44px]"><i class="fa-solid fa-check mr-2"></i> Enable Notifications</button>
        <button @click="skipNotificationPermission" class="w-full bg-white/5 text-white px-6 py-4 rounded-[20px] font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 min-h-[44px]">Continue Without</button>
      </div>
      <p class="text-[10px] text-gray-600 mt-4 uppercase tracking-wider">You can enable this anytime in your browser settings.</p>
    </div>
  </div>

  <!-- Calendar Permission Modal -->
  <div v-if="showCalendarPermissionModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
    <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-8 md:p-10 shadow-3xl text-center">
      <div class="text-5xl mb-6"><i class="fa-solid fa-calendar text-[#32D74B]"></i></div>
      <h3 class="text-2xl font-bold text-white mb-3">Enable Calendar & Reminders</h3>
      <p class="text-sm text-gray-400 mb-8 leading-relaxed">Allow SmartBand to create event reminders and calendar entries when you RSVP to events. Perfect for keeping track of rehearsals and performances!</p>
      <div class="flex gap-3 flex-col">
        <button @click="askCalendarPermission" class="w-full bg-[#32D74B] text-black px-6 py-4 rounded-[20px] font-bold text-sm uppercase tracking-widest hover:bg-[#2bc140] transition-all min-h-[44px]"><i class="fa-solid fa-check mr-2"></i> Enable Calendar</button>
        <button @click="skipCalendarPermission" class="w-full bg-white/5 text-white px-6 py-4 rounded-[20px] font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 min-h-[44px]">Maybe Later</button>
      </div>
      <p class="text-[10px] text-gray-600 mt-4 uppercase tracking-wider">You can enable calendar features anytime in settings.</p>
    </div>
  </div>

  <!-- Notification Denied - Redirect Modal -->
  <div v-if="notificationPermissionDenied && isLoggedIn" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
    <div class="bg-[#111111] border border-[#FF453A]/20 w-full max-w-md rounded-[44px] p-8 md:p-10 shadow-3xl text-center">
      <div class="text-5xl mb-6"><i class="fa-solid fa-circle-exclamation text-[#FF453A]"></i></div>
      <h3 class="text-2xl font-bold text-white mb-3">Notifications Required</h3>
      <p class="text-sm text-gray-400 mb-8 leading-relaxed">Notifications are essential for receiving urgent announcements and critical updates from your band officers. Please enable notifications to continue.</p>
      <button @click="() => { isLoggedIn = false; notificationPermissionDenied = false; handleLogout(); }" class="w-full bg-[#FF453A] text-white px-6 py-4 rounded-[20px] font-bold text-sm uppercase tracking-widest hover:bg-[#ff5a47] transition-all min-h-[44px]"><i class="fa-solid fa-arrow-left mr-2"></i> Return to Login</button>
      <p class="text-[10px] text-gray-600 mt-4 uppercase tracking-wider">You'll be asked again after login.</p>
    </div>
  </div>

  <!-- Custom Confirm Modal -->
  <div v-if="confirmModal.show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl text-left">
    <div class="bg-[#111111] border border-[#FF453A]/20 w-full max-w-sm rounded-[32px] p-8 shadow-3xl text-center">
      <div class="text-4xl mb-4 text-[#FF453A]"><i class="fa-solid fa-triangle-exclamation"></i></div>
      <h3 class="text-xl font-bold text-white mb-2">{{ confirmModal.title }}</h3>
      <p class="text-sm text-gray-400 mb-8">{{ confirmModal.message }}</p>
      <div class="flex gap-3">
        <button @click="confirmModal.onCancel" class="flex-1 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold text-gray-300 hover:bg-white/5 transition-all min-h-[44px]">Cancel</button>
        <button @click="confirmModal.onConfirm" class="flex-1 py-3 bg-[#FF453A] text-white rounded-xl text-[10px] uppercase font-bold hover:bg-[#ff5a47] transition-all min-h-[44px]">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, provide } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import Login from './components/Login.vue';
import EditMemberModal from './components/modals/EditMemberModal.vue';
import MyProfileModal from './components/modals/MyProfileModal.vue';
import AddPostModal from './components/modals/AddPostModal.vue';
import AddEventModal from './components/modals/AddEventModal.vue';
import { supabase } from './supabase';

// --- UI STATE ---
const storedUser = localStorage.getItem('smartband_user');
const currentUser = ref(storedUser ? JSON.parse(storedUser) : null);
const isLoggedIn = ref(!!currentUser.value); 
const router = useRouter();
const route = useRoute();
const activeTab = computed({ get: () => route.name || 'dashboard', set: (val) => router.push({ name: val }) });


const selectedChannel = ref('general');
const isMessagesExpanded = ref(true);
let heartbeatInterval = null; 

// Push Notifications & Permissions
const showNotificationPermissionModal = ref(false);
const notificationPermissionDenied = ref(false);
const showCalendarPermissionModal = ref(false);
const notificationPermissionStatus = ref(Notification?.permission || 'default'); // 'default', 'granted', 'denied'
const calendarPermissionStatus = ref(localStorage.getItem('smartband_calendar_permission') || 'default'); // 'default', 'granted', 'denied'
const userPermissionsHandled = ref(localStorage.getItem('smartband_permissions_session') === 'true'); // Persist across sessions

// Toasts and Loading states
const toast = ref({ show: false, message: '', type: 'success' });
const isSubmitting = ref(false);
const isOffline = ref(!navigator.onLine);

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null,
  onCancel: null
});

const showConfirm = (title, message) => {
  return new Promise((resolve) => {
    confirmModal.value = {
      show: true,
      title,
      message,
      onConfirm: () => {
        confirmModal.value.show = false;
        resolve(true);
      },
      onCancel: () => {
        confirmModal.value.show = false;
        resolve(false);
      }
    };
  });
};

const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

// Modals & Forms
const showMobileMenu = ref(false); 
const showProfileMenu = ref(false);
const editingUser = ref(null);
const showMyProfileModal = ref(false);
const showAddPostModal = ref(false);
const showAddEventModal = ref(false);
const expandedEventId = ref(null);

const myProfileForm = ref({ firstName: '', lastName: '', instrument: '' });

// Data
const chatMessages = ref([]);
const newMessageContent = ref('');
const unreadMessages = ref({ general: 0, important: 0, sectionals: 0 });
const pendingUsers = ref([]);
const pendingCount = computed(() => pendingUsers.value.length);
let isInitialLoad = true; 
const roster = ref([]);
const allSheets = ref([]); 
const dashboardPosts = ref([]);
const dashboardEvents = ref([]);

const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion', 'None'];
const channels = [{ id: 'general', name: 'general', icon: 'fa-hashtag' }, { id: 'important', name: 'important', icon: 'fa-bullhorn' }, { id: 'sectionals', name: 'sectionals', icon: 'fa-users-rectangle' }];

const canManageDashboard = computed(() => ['admin', 'president', 'vp'].includes(currentUser.value?.role?.toLowerCase()));

// --- OFFICER ROLE MANAGEMENT LOGIC ---
const getAssignedOfficerRoles = computed(() => {
  if (!roster.value) return [];
  const officerRoles = ['president', 'vp', 'secretary', 'treasurer'];
  // Find which officer roles are already taken by OTHER people
  return roster.value
    .filter(u => officerRoles.includes(u.role) && u.id !== editingUser.value?.id)
    .map(u => u.role);
});

const getAvailableRoles = computed(() => {
  const assigned = getAssignedOfficerRoles.value || [];
  const isAdmin = currentUser.value?.role?.toLowerCase() === 'admin';
  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'president', label: 'President' },
    { value: 'vp', label: 'Vice President' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'member', label: 'General Member' }
  ];

  return roles.map(r => {
    let isDisabled = assigned.includes(r.value);
    // Non-admins can't change any roles, so disable all options except the user's current role
    if (!isAdmin && editingUser.value && r.value !== editingUser.value.role) {
      isDisabled = true;
    }
    return {
      ...r,
      disabled: isDisabled // Disable if someone else has this role or if not admin
    };
  });
});

const userInitials = computed(() => `${currentUser.value?.first_name[0]}${currentUser.value?.last_name[0]}`.toUpperCase());

const filteredTabs = computed(() => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-border-all' },
    { id: 'messages', name: 'Messages', icon: 'fa-regular fa-message' }, 
    { id: 'music', name: 'Music Library', icon: 'fa-solid fa-sheet-music' },
    { id: 'roster', name: 'Band Roster', icon: 'fa-solid fa-users' },
    { id: 'requests', name: 'Requests', icon: 'fa-solid fa-user-shield', adminOnly: true }
  ];
  return tabs.filter(t => !t.adminOnly || ['admin', 'president', 'vp'].includes(currentUser.value?.role?.toLowerCase()));
});

const filteredSheets = computed(() => {
  if (currentUser.value?.role?.toLowerCase() === 'admin') return allSheets.value;
  return allSheets.value.filter(s => s.instrument === currentUser.value?.instrument || s.instrument === 'All');
});

// ==========================================
// SUPABASE DATA FETCHING
// ==========================================

// Add a ref to store acknowledgments
const allAcknowledgments = ref([]);
const allRSVPs = ref([]);

// Fetch them when loading the dashboard
const loadDashboard = async () => {
  const [
    { data: posts },
    { data: events },
    { data: acks },
    { data: rsvps }
  ] = await Promise.all([
    supabase.from('feed_posts').select('*, users(first_name, last_name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('events').select('*').order('event_date', { ascending: true }),
    supabase.from('post_acknowledgments').select('*'),
    supabase.from('event_rsvps').select('*')
  ]);

  if (acks) allAcknowledgments.value = acks;
  if (rsvps) allRSVPs.value = rsvps;
  if (posts) dashboardPosts.value = posts;
  if (events) dashboardEvents.value = events;
};

// NEW: The Acknowledge Function
const acknowledgePost = async (postId) => {
  const { error } = await supabase.from('post_acknowledgments').insert({
    user_id: currentUser.value.id,
    post_id: postId,
    acknowledged_at: new Date().toISOString()
  });

  if (!error) {
    showToast('Marked as read!');
    loadDashboard(); // Refresh to update UI
  } else {
    showToast('Failed to acknowledge', 'error');
  }
};

// NEW: Helper Functions for the UI
const hasAcknowledged = (postId) => {
  return allAcknowledgments.value.some(ack => ack.post_id === postId && ack.user_id === currentUser.value.id);
};

const getAckCount = (postId) => {
  return allAcknowledgments.value.filter(ack => ack.post_id === postId).length;
};

// ==========================================
// TRACKING LOGIC: EVENT RSVPS
// ==========================================
const submitRSVP = async (eventId, status, eventObj = null) => {
  try {
    // Check if the user already responded to this event
    const existingRecord = allRSVPs.value.find(r => r.event_id === eventId && r.user_id === currentUser.value.id);

    let error = null;

    if (existingRecord) {
      // Update existing RSVP
      const result = await supabase.from('event_rsvps')
        .update({ status: status, responded_at: new Date().toISOString() })
        .eq('id', existingRecord.id);
      error = result.error;
    } else {
      // Insert new RSVP
      const result = await supabase.from('event_rsvps').insert({
        user_id: currentUser.value.id,
        event_id: eventId,
        status: status,
        responded_at: new Date().toISOString()
      });
      error = result.error;
    }

    if (!error) {
      showToast('Updated!');
      
      // Add to calendar if user marked as "going"
      if (status === 'going' && eventObj) {
        if (calendarPermissionStatus.value === 'granted') {
          // Permission already granted - add to calendar
          addEventToCalendar(eventObj, status);
        } else if (calendarPermissionStatus.value === 'default') {
          // Permission not requested - show modal
          showCalendarPermissionModal.value = true;
        }
        // If denied, silently skip
      }
      
      await loadDashboard();
      // Ensure roster is loaded for attendees list
      if (roster.value.length === 0) {
        await fetchRoster();
      }
    } else {
      showToast('Failed to save RSVP: ' + error.message, 'error');
      console.error('RSVP Error:', error);
    }
  } catch (err) {
    showToast('Error saving RSVP', 'error');
    console.error('Exception in submitRSVP:', err);
  }
  checkEventReminders();
};

const getUserRSVP = (eventId) => {
  const rsvp = allRSVPs.value.find(r => r.event_id === eventId && r.user_id === currentUser.value.id);
  return rsvp ? rsvp.status : null; // returns 'going', 'not_going', or null
};

const getRSVPStats = (eventId) => {
  const eventRsvps = allRSVPs.value.filter(r => r.event_id === eventId);
  return {
    going: eventRsvps.filter(r => r.status === 'going').length,
    notGoing: eventRsvps.filter(r => r.status === 'not_going').length
  };
};

const getAttendeesList = (eventId) => {
  const eventRsvps = allRSVPs.value.filter(r => r.event_id === eventId);
  const goingList = eventRsvps
    .filter(r => r.status === 'going')
    .map(r => {
      const user = roster.value.find(u => u.id === r.user_id);
      return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
    });
  const notGoingList = eventRsvps
    .filter(r => r.status === 'not_going')
    .map(r => {
      const user = roster.value.find(u => u.id === r.user_id);
      return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
    });
  return { goingList, notGoingList };
};

const fetchMessages = async () => {
  const { data } = await supabase.from('messages')
    .select('*, users(first_name, last_name)')
    .eq('channel', selectedChannel.value)
    .order('created_at', { ascending: false })
    .limit(50);
    
  if (data) {
    chatMessages.value = data.reverse().map(msg => ({
      ...msg,
      first_name: msg.users?.first_name,
      last_name: msg.users?.last_name
    }));
    // Clear unread for this channel when viewing it
    unreadMessages.value[selectedChannel.value] = 0;
    await nextTick();
    scrollToBottom();
  }
};

const fetchRoster = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('status', 'approved').order('role', { ascending: true });
    if (error) throw error;
    if (data) roster.value = data;
  } catch (err) {
    console.error('Failed to fetch roster:', err);
    showToast('Failed to load roster', 'error');
  }
};

const fetchMusicSheets = async () => {
  const { data } = await supabase.from('music_sheets').select('*').order('created_at', { ascending: false });
  if (data) allSheets.value = data;
};

const fetchPendingUsers = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('status', 'pending');
    if (error) throw error;
    if (data) {
      if (data.length > pendingUsers.value.length && !isInitialLoad) {
        if (typeof playAlarmSound === 'function') playAlarmSound(); 
      }
      pendingUsers.value = data;
    }
  } catch (err) {
    console.error('Failed to fetch pending users:', err);
  }
  isInitialLoad = false;
};

// ==========================================
// SUPABASE ACTIONS
// ==========================================

const sendMessage = async () => {
  if (isSubmitting.value || !newMessageContent.value.trim()) return;
  isSubmitting.value = true;
  
  const { error } = await supabase.from('messages').insert({
    sender_id: currentUser.value.id,
    channel: selectedChannel.value,
    content: newMessageContent.value
  });

  if (!error) {
    newMessageContent.value = '';
    // Realtime listener in setupRealtime() handles adding the message to chatMessages
  } else {
    showToast('Message failed to send', 'error');
    console.error("SUPABASE SEND ERROR:", error);
  }
  
  isSubmitting.value = false;
};

const updateMyProfile = async (formData) => {
  if (formData.passwords?.current && formData.passwords?.new) {
    // Attempt to verify the current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentUser.value.email,
      password: formData.passwords.current
    });
    if (verifyError) {
      showToast('Current password incorrect', 'error');
      return;
    }
    
    // Update the password
    const { error: pwdError } = await supabase.auth.updateUser({
      password: formData.passwords.new
    });
    if (pwdError) {
      showToast(pwdError.message, 'error');
      return;
    }
  }

  const { error } = await supabase.from('users')
    .update({ first_name: formData.firstName, last_name: formData.lastName, instrument: formData.instrument })
    .eq('id', currentUser.value.id);

  if (!error) {
    currentUser.value.first_name = formData.firstName;
    currentUser.value.last_name = formData.lastName;
    currentUser.value.instrument = formData.instrument;
    localStorage.setItem('smartband_user', JSON.stringify(currentUser.value));
    showMyProfileModal.value = false;
    showToast('Profile updated!');
  } else showToast('Failed to update profile', 'error');
};

const saveUserChanges = async () => {
  if (isSubmitting.value) return;

  // --- Strict Security Validations ---
  const originalUser = roster.value.find(u => u.id === editingUser.value.id);
  
  if (currentUser.value.role?.toLowerCase() !== 'admin') {
    // 1. Officers cannot edit Admins
    if (originalUser && originalUser.role?.toLowerCase() === 'admin') {
      showToast("Permission denied: You cannot edit an Admin.", "error");
      return;
    }
    // 2. Officers cannot change roles of anyone
    if (originalUser && editingUser.value.role !== originalUser.role) {
      showToast("Permission denied: Only Admins can change roles.", "error");
      return;
    }
  }

  // 4. Admins cannot strip their own Admin status (prevents locking out the system)
  if (currentUser.value.role?.toLowerCase() === 'admin' && editingUser.value.id === currentUser.value.id && editingUser.value.role?.toLowerCase() !== 'admin') {
    showToast("You cannot remove your own Admin status.", "error");
    return;
  }

  isSubmitting.value = true;
  
  try {
    const { error } = await supabase.from('users')
      .update({ role: editingUser.value.role, tier: editingUser.value.tier, instrument: editingUser.value.instrument })
      .eq('id', editingUser.value.id);
    
    if (!error) { 
      editingUser.value = null; 
      showToast('Member updated!'); 
      await fetchRoster();
    } else { 
      showToast('Error saving changes', 'error');
      console.error('Supabase error:', error);
    }
  } catch (err) {
    showToast('Failed to save changes', 'error');
    console.error('Exception in saveUserChanges:', err);
  } finally {
    isSubmitting.value = false;
  }
};

// Bridge: receives updated user data from EditMemberModal then runs save
const handleSaveUser = async (updatedUser) => {
  editingUser.value = updatedUser;
  await saveUserChanges();
};

const deleteUser = async (uId) => {
  // 1. No one can delete themselves
  if (uId === currentUser.value.id) {
    showToast("Action blocked: You cannot delete your own account.", "error");
    return;
  }

  // 2. Only Admins can delete Admins
  const targetUser = roster.value.find(u => u.id === uId) || pendingUsers.value.find(u => u.id === uId);
  if (targetUser && targetUser.role?.toLowerCase() === 'admin' && currentUser.value.role?.toLowerCase() !== 'admin') {
    showToast("Permission denied: You cannot delete an Admin.", "error");
    return;
  }

  if(!(await showConfirm("Delete Member", "Permanently delete this member?"))) return;
  isSubmitting.value = true;
  
  try {
    const { error } = await supabase.from('users').delete().eq('id', uId);
    if (!error) { 
      showToast('Member deleted'); 
      await fetchRoster();
    }
    else {
      showToast('Error deleting member', 'error');
      console.error('Supabase error:', error);
    }
  } catch (err) {
    showToast('Failed to delete member', 'error');
    console.error('Exception in deleteUser:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const approveUser = async (uId) => {
  isSubmitting.value = true;
  
  try {
    const { error } = await supabase.from('users').update({ status: 'approved' }).eq('id', uId);
    if (!error) { 
      showToast('Member approved!'); 
      await fetchPendingUsers(); 
      await fetchRoster();
    }
    else {
      showToast('Failed to approve', 'error');
      console.error('Supabase error:', error);
    }
  } catch (err) {
    showToast('Failed to approve member', 'error');
    console.error('Exception in approveUser:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const declineUser = async (uId) => {
  if (!(await showConfirm("Decline Request", "Are you sure you want to decline and delete this request?"))) return;
  isSubmitting.value = true;
  
  try {
    const { error } = await supabase.from('users').delete().eq('id', uId);
    if (!error) { 
      showToast('Request declined'); 
      await fetchPendingUsers();
    }
    else {
      showToast('Failed to decline user', 'error');
      console.error('Supabase error:', error);
    }
  } catch (err) {
    showToast('Failed to decline user', 'error');
    console.error('Exception in declineUser:', err);
  } finally {
    isSubmitting.value = false;
  }
};

const submitPost = async (formData) => {
  if (isSubmitting.value) return;
  if (!formData.title.trim() || !formData.message.trim()) { showToast('Title and message required', 'error'); return; }
  isSubmitting.value = true;
  const { error } = await supabase.from('feed_posts').insert({
    author_id: currentUser.value.id, title: formData.title, message: formData.message, is_urgent: formData.isUrgent
  });
  if (!error) { showAddPostModal.value = false; showToast('Posted!'); }
  // Realtime INSERT listener in setupRealtime() will add the post to dashboardPosts automatically
  else showToast('Failed to post', 'error');
  isSubmitting.value = false;
};

const deletePost = async (id) => {
  if(await showConfirm("Delete Post", "Delete this post?")) { 
    const { error } = await supabase.from('feed_posts').delete().eq('id', id);
    if(!error) { showToast('Post deleted'); loadDashboard(); }
  }
};

const submitEvent = async (formData) => {
  if (isSubmitting.value) return;
  if (!formData.title.trim() || !formData.date || !formData.time.trim() || !formData.location.trim()) { showToast('All event fields required', 'error'); return; }
  isSubmitting.value = true;
  
  // Format the time to 12-hour AM/PM for standard display
  const [hours, minutes] = formData.time.split(':');
  const parsedHour = parseInt(hours);
  const ampm = parsedHour >= 12 ? 'PM' : 'AM';
  const displayHour = parsedHour % 12 || 12;
  const formattedTimeStr = `${displayHour}:${minutes} ${ampm}`;

  const { error } = await supabase.from('events').insert({
    author_id: currentUser.value.id, event_date: formData.date, title: formData.title, time_str: formattedTimeStr, location: formData.location
  });
  if (!error) { showAddEventModal.value = false; showToast('Event scheduled!'); }
  // Realtime INSERT listener in setupRealtime() will add the event to dashboardEvents automatically
  else showToast('Failed to add event', 'error');
  isSubmitting.value = false;
};

const deleteEvent = async (id) => {
  if(await showConfirm("Delete Event", "Delete this event?")) { 
    const { error } = await supabase.from('events').delete().eq('id', id);
    if(!error) { showToast('Event deleted'); loadDashboard(); }
  }
};

const sendHeartbeat = async () => {
  if (currentUser.value) {
    await supabase.from('users').update({ last_seen: new Date().toISOString() }).eq('id', currentUser.value.id);
  }
};

// ==========================================
// HELPERS & LIFECYCLES
// ==========================================

const handleLoginSuccess = (userData) => {
  currentUser.value = userData; isLoggedIn.value = true;
  localStorage.setItem('smartband_user', JSON.stringify(userData));
  myProfileForm.value = { firstName: userData.first_name, lastName: userData.last_name, instrument: userData.instrument };
  
  loadDashboard(); fetchRoster(); fetchMusicSheets();
  if (['admin', 'president', 'vp'].includes(userData.role?.toLowerCase())) fetchPendingUsers();
  
  sendHeartbeat();
  setupRealtime();
  
  // Check if permissions have been handled in this browser (persistent across sessions)
  if (!userPermissionsHandled.value) {
    userPermissionsHandled.value = true;
    localStorage.setItem('smartband_permissions_session', 'true');
    
    setTimeout(() => {
      // Check current notification permission status
      const currentStatus = Notification?.permission || 'default';
      notificationPermissionStatus.value = currentStatus;
      
      if (currentStatus === 'default') {
        // Permission hasn't been requested yet - show modal
        showNotificationPermissionModal.value = true;
      } else if (currentStatus === 'denied') {
        // Permission was previously denied
        notificationPermissionDenied.value = true;
      } else if (currentStatus === 'granted') {
        // Permission already granted - check calendar permission
        const calendarStatus = localStorage.getItem('smartband_calendar_permission') || 'default';
        if (calendarStatus === 'default') {
          setTimeout(() => showCalendarPermissionModal.value = true, 300);
        }
      }
    }, 500);
  }
};

// ==========================================
// PERMISSION MANAGEMENT
// ==========================================

const askNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    notificationPermissionStatus.value = permission;

    if (permission === 'granted') {
      showNotificationPermissionModal.value = false;
      showToast('✅ Notifications enabled! You\'ll get alerts for urgent messages.', 'success');
      
      // Show calendar permission modal next
      setTimeout(() => showCalendarPermissionModal.value = true, 500);
    } else if (permission === 'denied') {
      notificationPermissionDenied.value = true;
      showNotificationPermissionModal.value = false;
    }
  } catch (err) {
    console.error('Permission request error:', err);
    showToast('Could not request permission', 'error');
  }
};

const askCalendarPermission = async () => {
  // Browser calendar permission is limited - we can use the Calendar API if available
  // For now, we'll just acknowledge and set up local calendar integration
  calendarPermissionStatus.value = 'granted';
  localStorage.setItem('smartband_calendar_permission', 'granted');
  showToast('📅 Calendar integration ready! Event reminders will sync.', 'success');
  showCalendarPermissionModal.value = false;
};

const skipCalendarPermission = () => {
  calendarPermissionStatus.value = 'denied';
  localStorage.setItem('smartband_calendar_permission', 'denied');
  showCalendarPermissionModal.value = false;
};

const skipNotificationPermission = () => {
  showNotificationPermissionModal.value = false;
  localStorage.setItem('smartband_permissions_session', 'true');
  userPermissionsHandled.value = true;
  showToast('⏭️ You can enable notifications anytime in settings.', 'success');
};


const addEventToCalendar = (event, rsvpStatus) => {
  // Create iCalendar event for downloading or browser integration
  if (!event.event_date || !event.time_str) {
    showToast('Event time not set', 'error');
    return;
  }

  // Parse time - handle both "HH:MM" and "HH:MM AM/PM" formats
  let timeStr = event.time_str.trim();
  let hour = 0, minute = 0;
  
  if (timeStr.match(/^\d{1,2}:\d{2}\s*(AM|PM)$/i)) {
    // Time with AM/PM
    const parts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    hour = parseInt(parts[1]);
    minute = parseInt(parts[2]);
    const period = parts[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
  } else if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
    // Time in HH:MM format
    const parts = timeStr.split(':');
    hour = parseInt(parts[0]);
    minute = parseInt(parts[1]);
  }
  
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  
  // Format: YYYY-MM-DDTHH:MM:SS
  const dateTime = `${event.event_date}T${hourStr}:${minuteStr}:00`;
  const dateTimeFormatted = dateTime.replace(/-/g, '').replace(/:/g, '');
  
  // Create iCal format event
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmartBand//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:smartband-event-${event.id}-${currentUser.value.id}@smartband.local
DTSTART:${dateTimeFormatted}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title} ${rsvpStatus === 'going' ? '(Attending)' : '(Not Going)'}
LOCATION:${event.location || 'TBA'}
DESCRIPTION:SmartBand Event - You marked yourself as ${rsvpStatus === 'going' ? 'GOING' : 'NOT GOING'}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  // Method 1: Download .ics file (works on all devices - Windows, Mac, iOS, Android)
  try {
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartband-${event.title.replace(/\s+/g, '-')}-${event.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('✅ Calendar event downloaded! Open it to add to your device calendar.', 'success');
  } catch (err) {
    console.error('Calendar download error:', err);
    showToast('Could not download calendar file', 'error');
  }

  // Store in localStorage as backup reminder
  const reminders = JSON.parse(localStorage.getItem('smartband_reminders') || '[]');
  const reminder = {
    id: event.id,
    eventId: event.id,
    title: event.title,
    date: event.event_date,
    time: event.time_str,
    location: event.location,
    rsvpStatus: rsvpStatus,
    userId: currentUser.value.id,
    createdAt: new Date().toISOString()
  };
  const filtered = reminders.filter(r => r.eventId !== event.id);
  filtered.push(reminder);
  localStorage.setItem('smartband_reminders', JSON.stringify(filtered));
};

const handleLogout = () => {
  localStorage.removeItem('smartband_user'); 
  clearInterval(heartbeatInterval);
  window.location.reload(); 
};

const isOnline = (lastSeen) => { if(!lastSeen) return false; return (new Date() - new Date(lastSeen)) < 300000; };
const formatMonth = (d) => new Date(d).toLocaleString('default', { month: 'short' });
const formatDay = (d) => new Date(d).getDate();
const formatDate = (d) => new Date(d).toLocaleDateString();
const scrollToBottom = () => nextTick(() => { const b = document.getElementById('chatBox'); if(b) b.scrollTop = b.scrollHeight; });
const toggleProfile = () => { showProfileMenu.value = !showProfileMenu.value; };
const closeMenus = () => { showProfileMenu.value = false; showMobileMenu.value = false; };
const openEditModal = (u) => { 
  try {
    editingUser.value = { ...u }; 
  } catch (err) {
    showToast('Failed to open edit form', 'error');
    console.error('Exception in openEditModal:', err);
  }
};
const handleMessagesClick = () => { activeTab.value = 'messages'; isMessagesExpanded.value = !isMessagesExpanded.value; };

// --- SUPABASE REALTIME (The Magic that replaces Pusher) ---
let realtimeChannel;

const triggerBrowserNotification = (title, body) => {
  // Check the actual browser API permission directly, not just our ref
  if (window.Notification && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icon.png'
    });
  } else {
    console.warn("Notification blocked: Permission is", Notification.permission);
  }
};

const setupRealtime = () => {
  realtimeChannel = supabase.channel('smartband-sync')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      
      const sender = roster.value.find(u => u.id === payload.new.sender_id);
      const senderName = sender ? `${sender.first_name} ${sender.last_name}` : 'Someone';

      if (activeTab.value === 'messages' && selectedChannel.value === payload.new.channel) {
        chatMessages.value.push({
          ...payload.new,
          first_name: sender ? sender.first_name : 'User',
          last_name: sender ? sender.last_name : ''
        });
        scrollToBottom();
      } else {
        unreadMessages.value[payload.new.channel]++;
      }

      if (payload.new.sender_id !== currentUser.value.id) {
        triggerBrowserNotification(`${senderName} in #${payload.new.channel}`, payload.new.content);
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
      if (activeTab.value === 'roster') fetchRoster();
      if (activeTab.value === 'requests' && canManageDashboard.value) fetchPendingUsers();
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' }, (payload) => {
      if (activeTab.value === 'dashboard') {
        const sender = roster.value.find(u => u.id === payload.new.author_id) || currentUser.value;
        dashboardPosts.value.unshift({ ...payload.new, users: { first_name: sender.first_name, last_name: sender.last_name } });
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'feed_posts' }, (payload) => {
      if (activeTab.value === 'dashboard') dashboardPosts.value = dashboardPosts.value.filter(p => p.id !== payload.old.id);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
      if (activeTab.value === 'dashboard') {
        dashboardEvents.value.push(payload.new);
        dashboardEvents.value.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'events' }, (payload) => {
      if (activeTab.value === 'dashboard') dashboardEvents.value = dashboardEvents.value.filter(e => e.id !== payload.old.id);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_acknowledgments' }, (payload) => {
      allAcknowledgments.value.push(payload.new);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_rsvps' }, (payload) => {
      allRSVPs.value.push(payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'event_rsvps' }, (payload) => {
      const idx = allRSVPs.value.findIndex(r => r.id === payload.new.id);
      if (idx !== -1) allRSVPs.value[idx] = payload.new;
    })
    .subscribe();
};

const toggleAttendeesList = (eventId) => {
  expandedEventId.value = expandedEventId.value === eventId ? null : eventId;
};

const handleEscKey = (e) => {
  if (e.key === 'Escape') {
    editingUser.value = null; showMyProfileModal.value = false; showAddPostModal.value = false; showAddEventModal.value = false; showMobileMenu.value = false; 
  }
};


const uploadSheet = async (file, title, instrumentStr) => {
  if (!file) return;
  isSubmitting.value = true;
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sheets')
      .upload(fileName, file);
      
    if (uploadError) throw uploadError;
    
    const { data: urlData } = supabase.storage.from('sheets').getPublicUrl(fileName);
    
    const { error: dbError } = await supabase.from('music_sheets').insert({
      title: title,
      instrument: instrumentStr,
      file_path: urlData.publicUrl
    });
    
    if (dbError) throw dbError;
    
    showToast('Sheet uploaded successfully!');
    fetchMusicSheets();
  } catch (err) {
    showToast('Upload failed: ' + err.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteSheet = async (id, file_path) => {
  if(!(await showConfirm("Delete Score", "Permanently delete this score and file?"))) return;
  isSubmitting.value = true;
  try {
    // Extract filename from the end of the public URL
    const fileName = file_path.split('/').pop();
    if (fileName) {
      await supabase.storage.from('sheets').remove([fileName]);
    }
    const { error } = await supabase.from('music_sheets').delete().eq('id', id);
    if (!error) {
      showToast('Sheet deleted successfully!');
      fetchMusicSheets();
    } else throw error;
  } catch (err) {
    showToast('Failed to delete sheet: ' + err.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};
provide('smartband', {
  dashboardPosts, dashboardEvents, canManageDashboard, showAddPostModal, deletePost, formatDate, hasAcknowledged, acknowledgePost, getAckCount, showAddEventModal, deleteEvent, formatMonth, formatDay, submitRSVP, getUserRSVP, getRSVPStats, toggleAttendeesList, expandedEventId, getAttendeesList,
  chatMessages, newMessageContent, sendMessage, isSubmitting, selectedChannel, currentUser,
  filteredSheets, uploadSheet, deleteSheet,
  roster, isOnline, openEditModal, deleteUser,
  pendingUsers, declineUser, approveUser
});

onMounted(() => {
  window.addEventListener('keydown', handleEscKey); 
  window.addEventListener('offline', () => isOffline.value = true);
  window.addEventListener('online', () => { isOffline.value = false; showToast('Back online!', 'success'); }); 

  if(isLoggedIn.value) {
    myProfileForm.value = { 
      firstName: currentUser.value.first_name, 
      lastName: currentUser.value.last_name, 
      instrument: currentUser.value.instrument 
    };
    
    loadDashboard(); 
    fetchRoster(); 
    fetchMusicSheets();
    
    if (canManageDashboard.value) fetchPendingUsers();
    
    sendHeartbeat();
    heartbeatInterval = setInterval(sendHeartbeat, 120000); 
    
    // 1. Setup Supabase Realtime for messages/updates
    setupRealtime();

    // 2. Setup the event reminder check (every 1 minute)
    // Also run once after a short delay so events already close to now are caught on load
    setInterval(checkEventReminders, 60000);
    setTimeout(checkEventReminders, 5000); // initial check after dashboard data loads

    // 3. Only handle permission modals if not already handled this session
    if (!localStorage.getItem('smartband_permissions_session')) {
      handlePermissionLogic();
    }
  }
});

// Helper to handle the modal logic cleanely
const handlePermissionLogic = () => {
  const currentStatus = Notification?.permission || 'default';
  notificationPermissionStatus.value = currentStatus;
  
  if (currentStatus === 'default') {
    showNotificationPermissionModal.value = true;
  } else if (currentStatus === 'granted') {
    const calendarStatus = localStorage.getItem('smartband_calendar_permission') || 'default';
    if (calendarStatus === 'default') {
      showCalendarPermissionModal.value = true;
    }
  }
};

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey);
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  clearInterval(heartbeatInterval);
});

watch([activeTab, selectedChannel], ([tab, channel]) => {
  if (tab === 'messages') fetchMessages(); 
  if (tab === 'roster') fetchRoster();
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'music') fetchMusicSheets();
  if (tab === 'requests' && canManageDashboard.value) fetchPendingUsers();
});

// ==========================================
// ALARM SOUND (Web Audio API — no file needed)
// ==========================================
const playAlarmSound = (urgent = false) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Bell-like envelope: three short descending tones
    const tones = urgent
      ? [880, 660, 880, 660, 880]   // urgent: fast repeating
      : [880, 740, 622];             // gentle 3-note chime

    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const start = ctx.currentTime + i * 0.28;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.45, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.start(start);
      osc.stop(start + 0.55);
    });

    // Auto-close context after all tones
    setTimeout(() => ctx.close(), tones.length * 280 + 700);
  } catch (err) {
    console.warn('Alarm sound failed:', err);
  }
};

// Track which (eventId + minuteWindow) combos we've already notified
// to avoid double-firing in the same polling cycle.
const firedReminderKeys = new Set();

const checkEventReminders = () => {
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  // Use YYYY-MM-DD in local time (not UTC) so the date matches event_date
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  dashboardEvents.value.forEach(event => {
    // Notify for ALL roadmap events on today's date (not just RSVP'd ones)
    if (event.event_date !== localDate || !event.time_str) return;

    // Parse time_str — handles "2:30 PM" and "14:30" formats
    const timeParts = event.time_str.trim().split(' ');
    const [hourStr, minStr] = timeParts[0].split(':');
    let eventHours = parseInt(hourStr);
    const eventMinutes = parseInt(minStr);

    if (timeParts.length >= 2) {
      const period = timeParts[1].toUpperCase();
      if (period === 'PM' && eventHours !== 12) eventHours += 12;
      if (period === 'AM' && eventHours === 12) eventHours = 0;
    }

    const eventDate = new Date();
    eventDate.setHours(eventHours, eventMinutes, 0, 0);

    const timeDiffMinutes = Math.round((eventDate - now) / 60000);
    const rsvpStatus = getUserRSVP(event.id); // 'going', 'not_going', or null

    // --- 5-Minute Warning (alarm + push notification) ---
    const key5 = `${event.id}:5`;
    if (timeDiffMinutes === 5 && !firedReminderKeys.has(key5)) {
      firedReminderKeys.add(key5);
      playAlarmSound(false);
      const rsvpSuffix = rsvpStatus === 'going' ? ' · You RSVPd Going' : rsvpStatus === 'not_going' ? " · You said Can't Make It" : '';
      triggerBrowserNotification(
        `⏰ Event in 5 Minutes: ${event.title}`,
        `Starting at ${event.time_str} · ${event.location || 'TBA'}${rsvpSuffix}`
      );
      // Also show in-app toast so they notice even if the tab is focused
      showToast(`⏰ "${event.title}" starts in 5 minutes!`, 'success');
    }

    // --- 15-Minute Warning (push only, no alarm) ---
    const key15 = `${event.id}:15`;
    if (timeDiffMinutes === 15 && !firedReminderKeys.has(key15)) {
      firedReminderKeys.add(key15);
      triggerBrowserNotification(
        `📅 Reminder: ${event.title} in 15 Min`,
        `${event.time_str} · ${event.location || 'TBA'}`
      );
    }

    // --- Now! (urgent alarm + push notification) ---
    const key0 = `${event.id}:0`;
    if (timeDiffMinutes === 0 && !firedReminderKeys.has(key0)) {
      firedReminderKeys.add(key0);
      playAlarmSound(true); // urgent = faster beeping
      triggerBrowserNotification(
        `🔔 Starting NOW: ${event.title}`,
        `${event.location || 'TBA'} — It\'s time!`
      );
      showToast(`🔔 "${event.title}" is starting NOW!`, 'success');
    }
  });

  // Prune old keys for past events so the Set doesn't grow forever
  // (cleanup once per call: remove keys whose event is no longer in dashboardEvents)
  const activeIds = new Set(dashboardEvents.value.map(e => e.id));
  for (const key of firedReminderKeys) {
    const id = key.split(':')[0];
    if (!activeIds.has(id) && !activeIds.has(parseInt(id))) {
      firedReminderKeys.delete(key);
    }
  }
};
</script>