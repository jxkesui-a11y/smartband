<template>
  <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />

  <div v-if="isLoggedIn && !notificationPermissionDenied" class="min-h-screen bg-black p-4 md:p-6 flex gap-6 font-sans text-gray-100 overflow-hidden relative text-left">
    
    <div v-if="toast.show" class="fixed top-10 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 z-[200] px-8 py-4 rounded-2xl shadow-2xl transition-all font-bold text-sm uppercase tracking-widest animate-in slide-in-from-top-10" :class="toast.type === 'error' ? 'bg-[#FF453A] text-white' : 'bg-[#32D74B] text-black'">
      <i class="mr-2" :class="toast.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i> {{ toast.message }}
    </div>

    <div class="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(60,10,10,0.4)_0%,rgba(0,0,0,0)_60%)] pointer-events-none -z-10"></div>
    
    <div v-if="showProfileMenu || showNotiMenu || showMobileMenu" @click="closeMenus" class="fixed inset-0 z-40"></div>

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

        <div v-if="activeTab === 'dashboard'" class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] xl:grid-cols-[1.5fr_1fr] gap-6 md:gap-8">
            <section>
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-bold text-white uppercase tracking-widest"><i class="fa-solid fa-bullhorn text-gray-500 mr-2"></i> Band Feed</h2>
                <button v-if="canManageDashboard" @click="showAddPostModal = true" class="text-[10px] bg-[#F5C518] text-black px-4 py-2 font-bold uppercase rounded-lg hover:scale-105 transition-transform"><i class="fa-solid fa-plus mr-1"></i> Add Post</button>
              </div>
              <div v-for="noti in dashboardPosts" :key="noti.id" class="p-4 md:p-6 rounded-2xl border mb-4 bg-[#111111] relative group flex flex-col" :class="noti.is_urgent ? 'border-[#4a1c1c] bg-[#1a0f0f]' : 'border-white/5'">
                <button v-if="canManageDashboard" @click="deletePost(noti.id)" class="absolute top-4 right-4 text-gray-600 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"><i class="fa-solid fa-trash"></i></button>
                <div class="flex justify-between items-center mb-4"><span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">{{ formatDate(noti.created_at) }} - By {{ noti.users?.first_name }}</span></div>
                <h3 class="font-bold text-white text-base md:text-lg mb-2">{{ noti.title }}</h3>
                <p class="text-xs md:text-sm text-gray-400 leading-relaxed break-words flex-1">{{ noti.message }}</p>

                <div v-if="noti.is_urgent" class="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                  <button v-if="!hasAcknowledged(noti.id)" @click="acknowledgePost(noti.id)" class="bg-[#32D74B]/10 text-[#32D74B] border border-[#32D74B]/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#32D74B]/20 transition-all">
                    <i class="fa-solid fa-check mr-1"></i> Acknowledge
                  </button>
                  <span v-else class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <i class="fa-solid fa-check-double text-[#32D74B] mr-1"></i> Acknowledged
                  </span>
                  <span v-if="canManageDashboard" class="text-[10px] text-[#F5C518] uppercase tracking-widest font-bold">
                    <i class="fa-solid fa-eye mr-1"></i> {{ getAckCount(noti.id) }} Views
                  </span>
                </div>
              </div>
              <div v-if="dashboardPosts.length === 0" class="text-gray-600 text-sm italic">No active announcements.</div>
            </section>
            <section>
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-bold text-white uppercase tracking-widest"><i class="fa-regular fa-calendar text-gray-500 mr-2"></i> Roadmap</h2>
                <button v-if="canManageDashboard" @click="showAddEventModal = true" class="text-[10px] bg-white/10 text-white px-4 py-2 font-bold uppercase rounded-lg hover:bg-white/20 hover:scale-105 transition-transform"><i class="fa-solid fa-calendar-plus mr-1"></i> Add Event</button>
              </div>
              <div v-for="event in dashboardEvents" :key="event.id" class="bg-[#111111] p-4 md:p-5 rounded-2xl border border-white/5 flex flex-col mb-4 relative group">
                <button v-if="canManageDashboard" @click="deleteEvent(event.id)" class="absolute top-2 right-3 text-gray-600 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"><i class="fa-solid fa-times"></i></button>
                
                <div class="flex items-center gap-4 md:gap-5">
                  <div class="w-14 h-14 md:w-16 md:h-16 bg-black/50 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-[#F5C518] shrink-0">
                     <span class="text-[8px] md:text-[10px] font-bold uppercase opacity-60">{{ formatMonth(event.event_date) }}</span>
                     <span class="text-xl md:text-2xl font-bold text-white leading-tight">{{ formatDay(event.event_date) }}</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-white text-sm md:text-base break-words">{{ event.title }}</h4>
                    <p class="text-[9px] md:text-[11px] text-gray-500 uppercase tracking-wider mt-1">{{ event.time_str }} | {{ event.location }}</p>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-white/5 flex flex-col gap-3 w-full">
                  <div class="flex gap-2">
                    <button @click="submitRSVP(event.id, 'going', event)" :class="getUserRSVP(event.id) === 'going' ? 'bg-[#32D74B] text-black' : 'bg-white/5 text-white hover:bg-white/10'" class="flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold transition-all border border-white/5">
                      <i class="fa-solid fa-thumbs-up mr-1"></i> Going
                    </button>
                    <button @click="submitRSVP(event.id, 'not_going', event)" :class="getUserRSVP(event.id) === 'not_going' ? 'bg-[#FF453A] text-white' : 'bg-white/5 text-white hover:bg-white/10'" class="flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold transition-all border border-white/5">
                      <i class="fa-solid fa-thumbs-down mr-1"></i> Can't Make It
                    </button>
                  </div>
                  <div class="flex justify-between text-[10px] text-gray-500 uppercase font-bold px-1">
                    <span class="text-[#32D74B] cursor-pointer hover:text-white transition-colors" @click="toggleAttendeesList(event.id)">
                      <i :class="expandedEventId === event.id ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="mr-1"></i>
                      {{ getRSVPStats(event.id).going }} Going
                    </span>
                    <span class="text-[#FF453A] cursor-pointer hover:text-white transition-colors" @click="toggleAttendeesList(event.id)">
                      {{ getRSVPStats(event.id).notGoing }} Not Going
                      <i :class="expandedEventId === event.id ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="ml-1"></i>
                    </span>
                  </div>

                  <div v-if="expandedEventId === event.id" class="mt-3 pt-3 border-t border-white/10 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <div v-if="getAttendeesList(event.id).goingList.length > 0" class="flex flex-col gap-2">
                      <p class="text-[10px] font-bold uppercase text-[#32D74B] tracking-widest">Going ({{ getAttendeesList(event.id).goingList.length }})</p>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="(attendee, idx) in getAttendeesList(event.id).goingList" :key="'going-' + idx" class="bg-[#32D74B]/10 text-[#32D74B] px-3 py-1.5 rounded-lg text-[9px] font-bold border border-[#32D74B]/20">
                          {{ attendee }}
                        </span>
                      </div>
                    </div>

                    <div v-if="getAttendeesList(event.id).notGoingList.length > 0" class="flex flex-col gap-2">
                      <p class="text-[10px] font-bold uppercase text-[#FF453A] tracking-widest">Can't Make It ({{ getAttendeesList(event.id).notGoingList.length }})</p>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="(attendee, idx) in getAttendeesList(event.id).notGoingList" :key="'notgoing-' + idx" class="bg-[#FF453A]/10 text-[#FF453A] px-3 py-1.5 rounded-lg text-[9px] font-bold border border-[#FF453A]/20">
                          {{ attendee }}
                        </span>
                      </div>
                    </div>

                    <div v-if="getAttendeesList(event.id).goingList.length === 0 && getAttendeesList(event.id).notGoingList.length === 0" class="text-[10px] text-gray-500 italic text-center py-2">
                      No RSVPs yet
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="dashboardEvents.length === 0" class="text-gray-600 text-sm italic">No upcoming events scheduled.</div>
            </section>
        </div>

        <div v-else-if="activeTab === 'messages'" class="flex flex-col bg-[#111111] rounded-[32px] p-4 md:p-6 border border-white/5 h-[calc(100vh-10rem)] md:h-[600px] shadow-inner relative">
          <div id="chatBox" class="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 p-2 md:p-4 scroll-smooth">
            <div v-for="msg in chatMessages" :key="msg.id" class="max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-[22px]" :class="msg.sender_id == currentUser.id ? 'bg-[#F5C518] text-black self-end rounded-tr-none' : 'bg-white/5 text-white self-start rounded-tl-none'">
              <p v-if="msg.sender_id != currentUser.id" class="text-[9px] font-bold uppercase opacity-50 mb-1">{{ msg.first_name }} {{ msg.last_name }}</p>
              <p class="text-sm leading-relaxed break-words">{{ msg.content }}</p>
              <p class="text-[8px] mt-1 opacity-40 text-right">{{ new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</p>
            </div>
          </div>
          <div class="flex gap-2 md:gap-3 border-t border-white/5 pt-4">
            <input v-model="newMessageContent" @keyup.enter="sendMessage" type="text" maxlength="500" :placeholder="'Message #' + selectedChannel" class="flex-1 bg-black border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:border-[#F5C518] transition-all shadow-inner disabled:opacity-50" :disabled="isSubmitting">
            <button @click="sendMessage" :disabled="isSubmitting" class="bg-[#F5C518] text-black px-6 md:px-10 rounded-2xl font-bold transition-all hover:bg-[#d4a914] disabled:opacity-50 min-h-[44px]"><i class="fa-solid" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i></button>
          </div>
        </div>

        <div v-else-if="activeTab === 'music'" class="flex flex-col gap-8">
           <h2 class="text-xl font-bold text-white uppercase tracking-widest mb-4">Score Repository</h2>
           <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
             <div v-for="sheet in filteredSheets" :key="sheet.id" class="bg-[#111111] p-6 md:p-7 rounded-[28px] border border-white/5 flex items-center gap-4 md:gap-6">
                <div class="flex-1 text-left min-w-0"><h4 class="font-bold text-white text-base md:text-lg truncate">{{ sheet.title }}</h4><p class="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-2">{{ sheet.instrument }}</p></div>
                <a :href="sheet.file_path" target="_blank" class="text-xl text-[#F5C518] hover:scale-110 transition-transform p-2"><i class="fa-solid fa-download"></i></a>
             </div>
           </div>
        </div>

        <div v-else-if="activeTab === 'roster'" class="bg-[#111111] border border-white/5 rounded-[32px] overflow-hidden shadow-3xl overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-white/5 text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">
              <tr>
                <th class="px-4 md:px-8 py-4 md:py-5">Name</th>
                <th class="px-4 md:px-8 py-4 md:py-5 hidden md:table-cell">Position</th>
                <th class="px-4 md:px-8 py-4 md:py-5 hidden md:table-cell">Instrument</th>
                <th class="px-4 md:px-8 py-4 md:py-5">Status</th>
                <th v-if="currentUser?.role === 'admin'" class="px-4 md:px-8 py-4 md:py-5 text-right pr-6 md:pr-12">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="user in roster" :key="user.id" class="hover:bg-white/[0.02] transition-colors">
                <td class="px-4 md:px-8 py-4 md:py-6 font-bold text-white">
                  {{ user.first_name }} {{ user.last_name }}
                  <div class="md:hidden text-[10px] text-gray-500 mt-1 uppercase">{{ user.role }} • <span class="text-[#F5C518]">{{ user.instrument }}</span></div>
                </td>
                <td class="px-4 md:px-8 py-4 md:py-6 capitalize hidden md:table-cell"><span class="bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/5 uppercase text-gray-300">{{ user.role }}</span></td>
                <td class="px-4 md:px-8 py-4 md:py-6 text-[#F5C518] font-bold uppercase tracking-tighter hidden md:table-cell">{{ user.instrument }}</td>
                <td class="px-4 md:px-8 py-4 md:py-6"><div class="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest" :class="isOnline(user.last_seen) ? 'text-green-500' : 'text-gray-500'"><span class="w-2 h-2 rounded-full shrink-0" :class="isOnline(user.last_seen) ? 'bg-green-500' : 'bg-gray-600'"></span><span class="truncate max-w-[80px] md:max-w-none">{{ isOnline(user.last_seen) ? 'Online' : 'Offline' }}</span></div></td>
                <td v-if="currentUser?.role === 'admin'" class="px-4 md:px-8 py-4 md:py-6 text-right pr-6 md:pr-12 flex justify-end gap-2">
                  <button @click="openEditModal(user)" class="text-[10px] font-bold bg-white/5 px-3 py-2 md:px-4 rounded-xl uppercase hover:bg-[#F5C518] hover:text-black transition-all border border-white/5 min-h-[44px]">Edit</button>
                  <button v-if="user.id !== currentUser.id" @click="deleteUser(user.id)" class="text-[10px] font-bold bg-white/5 px-3 py-2 md:px-4 rounded-xl uppercase hover:bg-red-500 hover:text-white transition-all border border-white/5 min-h-[44px]"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeTab === 'requests'" class="max-w-4xl mx-auto flex flex-col gap-6 animate-in slide-in-from-top-4 duration-500">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold flex items-center gap-3"><i class="fa-solid fa-user-shield text-[#F5C518]"></i> Queue</h2>
    <div class="bg-[#FF453A]/10 text-[#FF453A] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#FF453A]/20">{{ pendingUsers.length }}</div>
  </div>
  
  <div v-if="pendingUsers.length === 0" class="text-center py-24 text-gray-700 italic flex flex-col items-center">
    <i class="fa-solid fa-check-circle text-6xl mb-6 opacity-5"></i>
    <p class="text-lg">All members verified.</p>
  </div>
  
  <div v-for="user in pendingUsers" :key="user.id" class="bg-[#111111] border border-white/5 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
    
    <div class="flex items-center gap-4 md:gap-6">
      <div>
        <h3 class="font-bold text-white text-lg md:text-xl">{{ user.first_name }} {{ user.last_name }}</h3>
        <p class="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">{{ user.instrument }} Request</p>
      </div>
    </div>
    
    <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
      <button @click="declineUser(user.id)" class="bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 px-6 md:px-8 py-3 md:py-4 rounded-[22px] text-xs font-bold uppercase tracking-widest hover:bg-[#FF453A]/20 transition-colors min-h-[44px]">
        Decline
      </button>
      <button @click="approveUser(user.id)" class="bg-[#32D74B] text-black px-8 md:px-12 py-3 md:py-4 rounded-[22px] text-xs font-bold uppercase tracking-widest hover:bg-[#28b33e] transition-colors min-h-[44px]">
        Grant Access
      </button>
    </div>

  </div>
</div>

      </div>
    </main>

    <div v-if="editingUser" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 shadow-3xl text-left max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl md:text-2xl font-bold mb-6">Manage Member</h3>
        <div class="flex flex-col gap-4 md:gap-5">
          <div>
            <select v-model="editingUser.role" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
              <option v-for="role in getAvailableRoles" :key="role.value" :value="role.value" :disabled="role.disabled" :class="role.disabled ? 'opacity-50' : ''">{{ role.label }}{{ role.disabled ? ' (Already Assigned)' : '' }}</option>
            </select>
            <p v-if="getAssignedOfficerRoles.length > 0" class="text-[10px] text-gray-500 mt-2 uppercase tracking-wider"><i class="fa-solid fa-info-circle mr-1"></i> Officer roles marked as assigned are already given to other members.</p>
          </div>
          <select v-model="editingUser.tier" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white capitalize outline-none focus:border-[#F5C518]"><option value="senior">Senior Musician</option><option value="junior">Junior Musician</option><option value="none">Staff / Non-Player</option></select>
          <select v-model="editingUser.instrument" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]"><option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option></select>
          <div class="flex gap-3 md:gap-4 pt-4 md:pt-6"><button @click="editingUser = null" class="flex-1 py-4 md:py-5 border border-white/10 rounded-[20px] text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 min-h-[44px]" :disabled="isSubmitting">Cancel</button><button @click="saveUserChanges" class="flex-1 py-4 md:py-5 bg-[#F5C518] text-black rounded-[20px] font-bold text-[10px] uppercase tracking-widest min-h-[44px]" :disabled="isSubmitting"><i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-2"></i>{{ isSubmitting ? 'Saving...' : 'Save' }}</button></div>
        </div>
      </div>
    </div>

    <div v-if="showMyProfileModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 shadow-3xl text-left max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl md:text-2xl font-bold mb-6 text-white">Edit My Profile</h3>
        <div class="flex flex-col gap-4 md:gap-5">
          <div><label class="text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">First Name</label><input v-model="myProfileForm.firstName" maxlength="50" type="text" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]"></div>
          <div><label class="text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">Last Name</label><input v-model="myProfileForm.lastName" maxlength="50" type="text" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]"></div>
          <div><label class="text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">Instrument</label><select v-model="myProfileForm.instrument" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]"><option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option></select></div>
          <div class="flex gap-3 md:gap-4 pt-4 md:pt-6"><button @click="showMyProfileModal = false" class="flex-1 py-4 md:py-5 border border-white/10 rounded-[20px] text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 min-h-[44px]">Cancel</button><button @click="updateMyProfile" class="flex-1 py-4 md:py-5 bg-[#F5C518] text-black rounded-[20px] font-bold text-[10px] uppercase tracking-widest min-h-[44px]">Update</button></div>
        </div>
      </div>
    </div>

    <div v-if="showAddPostModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">New Post</h3>
        <input v-model="postForm.title" maxlength="100" placeholder="Title" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-4 text-sm text-white outline-none focus:border-[#F5C518]">
        <textarea v-model="postForm.message" maxlength="1000" placeholder="Message content..." class="w-full bg-black border border-white/10 rounded-xl p-4 mb-4 text-sm text-white outline-none h-24 md:h-32 focus:border-[#F5C518]"></textarea>
        <label class="flex items-center gap-2 text-sm text-white mb-6"><input type="checkbox" v-model="postForm.isUrgent" class="accent-[#F5C518]"> Mark as Urgent</label>
        <div class="flex gap-3 md:gap-4"><button @click="showAddPostModal = false" class="flex-1 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold min-h-[44px]">Cancel</button><button @click="submitPost" :disabled="isSubmitting" class="flex-1 py-3 bg-[#F5C518] text-black rounded-xl text-[10px] uppercase font-bold min-h-[44px] disabled:opacity-50"><i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-1"></i> Post</button></div>
      </div>
    </div>

    <div v-if="showAddEventModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">New Event</h3>
        <input v-model="eventForm.title" maxlength="100" placeholder="Event Name" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518]">
        <input type="date" v-model="eventForm.date" :min="getTodayDateString()" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518]" @change="validateEventDate">
        <p v-if="eventForm.date && new Date(eventForm.date) < new Date(getTodayDateString())" class="text-[#FF453A] text-[10px] mb-2">❌ Cannot schedule events in the past</p>
        <input v-model="eventForm.time" maxlength="50" placeholder="Time (e.g. 6:00 AM)" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518]">
        <input v-model="eventForm.location" maxlength="150" placeholder="Location" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-6 text-sm text-white outline-none focus:border-[#F5C518]">
        <div class="flex gap-3 md:gap-4"><button @click="showAddEventModal = false" class="flex-1 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold min-h-[44px]">Cancel</button><button @click="submitEvent" :disabled="isSubmitting || !eventForm.date || new Date(eventForm.date) < new Date(getTodayDateString())" class="flex-1 py-3 bg-[#F5C518] text-black rounded-xl text-[10px] uppercase font-bold min-h-[44px] disabled:opacity-50"><i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-1"></i> Add</button></div>
      </div>
    </div>

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
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import Login from './components/Login.vue';
import { supabase } from './supabase'; 

// --- UI STATE ---
const storedUser = localStorage.getItem('smartband_user');
const currentUser = ref(storedUser ? JSON.parse(storedUser) : null);
const isLoggedIn = ref(!!currentUser.value); 
const activeTab = ref('dashboard');
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
const dndExempted = ref(false);

// Toasts and Loading states
const toast = ref({ show: false, message: '', type: 'success' });
const isSubmitting = ref(false);

const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

// Modals & Forms
const showMobileMenu = ref(false); 
const showProfileMenu = ref(false);
const showNotiMenu = ref(false);
const editingUser = ref(null);
const showMyProfileModal = ref(false);
const showAddPostModal = ref(false);
const showAddEventModal = ref(false);
const expandedEventId = ref(null);

const myProfileForm = ref({ firstName: '', lastName: '', instrument: '' });
const postForm = ref({ title: '', message: '', isUrgent: false });
const eventForm = ref({ title: '', date: '', time: '', location: '' });

// Data
const chatMessages = ref([]);
const newMessageContent = ref('');
const unreadMessages = ref({ general: 0, important: 0, sectionals: 0 });
const pendingUsers = ref([]);
const pendingCount = ref(0);
let isInitialLoad = true; 
const roster = ref([]);
const allSheets = ref([]); 
const dashboardPosts = ref([]);
const dashboardEvents = ref([]);

const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion', 'None'];
const channels = [{ id: 'general', name: 'general', icon: 'fa-hashtag' }, { id: 'important', name: 'important', icon: 'fa-bullhorn' }, { id: 'sectionals', name: 'sectionals', icon: 'fa-users-rectangle' }];

const canManageDashboard = computed(() => ['admin', 'president', 'vp'].includes(currentUser.value?.role));
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
  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'president', label: 'President' },
    { value: 'vp', label: 'Vice President' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'member', label: 'General Member' }
  ];

  return roles.map(r => ({
    ...r,
    disabled: assigned.includes(r.value) // Disable if someone else has this role
  }));
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
  return tabs.filter(t => !t.adminOnly || currentUser.value?.role === 'admin');
});

const filteredSheets = computed(() => {
  if (currentUser.value?.role === 'admin') return allSheets.value;
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
  const { data: posts } = await supabase.from('feed_posts').select('*, users(first_name, last_name)').order('created_at', { ascending: false });
  const { data: events } = await supabase.from('events').select('*').order('event_date', { ascending: true });
  
  // Fetch Tracking Data
  const { data: acks } = await supabase.from('post_acknowledgments').select('*');
  if (acks) allAcknowledgments.value = acks;

  const { data: rsvps } = await supabase.from('event_rsvps').select('*');
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
      showToast('RSVP updated!');
      
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
    .order('created_at', { ascending: true });
    
  if (data) {
    chatMessages.value = data;
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
      if (data.length > pendingCount.value && !isInitialLoad) {
        if (typeof playAlarmSound === 'function') playAlarmSound(); 
      }
      pendingUsers.value = data;
      pendingCount.value = data.length;
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
    // Let the real-time listener catch it, but fetch manually just in case
    fetchMessages();
  } else {
    showToast('Message failed to send', 'error');
    console.error("SUPABASE SEND ERROR:", error);
  }
  
  isSubmitting.value = false;
};

const updateMyProfile = async () => {
  const { error } = await supabase.from('users')
    .update({ first_name: myProfileForm.value.firstName, last_name: myProfileForm.value.lastName, instrument: myProfileForm.value.instrument })
    .eq('id', currentUser.value.id);

  if (!error) {
    currentUser.value.first_name = myProfileForm.value.firstName;
    currentUser.value.last_name = myProfileForm.value.lastName;
    currentUser.value.instrument = myProfileForm.value.instrument;
    localStorage.setItem('smartband_user', JSON.stringify(currentUser.value));
    showMyProfileModal.value = false;
    showToast('Profile updated!');
  } else showToast('Failed to update profile', 'error');
};

const saveUserChanges = async () => {
  if (isSubmitting.value) return;
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

const deleteUser = async (uId) => {
  if(!confirm("Permanently delete this member?")) return;
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
  if (!confirm("Are you sure you want to decline and delete this request?")) return;
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

const submitPost = async () => {
  if (isSubmitting.value) return;
  if (!postForm.value.title.trim() || !postForm.value.message.trim()) { showToast('Title and message required', 'error'); return; }
  isSubmitting.value = true;
  const { error } = await supabase.from('feed_posts').insert({
    author_id: currentUser.value.id, title: postForm.value.title, message: postForm.value.message, is_urgent: postForm.value.isUrgent
  });
  if(!error) { showAddPostModal.value = false; postForm.value = {title: '', message: '', isUrgent: false}; showToast('Posted!'); loadDashboard(); }
  else showToast('Failed to post', 'error');
  isSubmitting.value = false;
};

const deletePost = async (id) => {
  if(confirm("Delete this post?")) { 
    const { error } = await supabase.from('feed_posts').delete().eq('id', id);
    if(!error) { showToast('Post deleted'); loadDashboard(); }
  }
};

const submitEvent = async () => {
  if (isSubmitting.value) return;
  if (!eventForm.value.title.trim() || !eventForm.value.date || !eventForm.value.time.trim() || !eventForm.value.location.trim()) { showToast('All event fields required', 'error'); return; }
  isSubmitting.value = true;
  const { error } = await supabase.from('events').insert({
    author_id: currentUser.value.id, event_date: eventForm.value.date, title: eventForm.value.title, time_str: eventForm.value.time, location: eventForm.value.location
  });
  if(!error) { showAddEventModal.value = false; eventForm.value = {title: '', date: '', time: '', location: ''}; showToast('Event scheduled!'); loadDashboard(); }
  else showToast('Failed to add event', 'error');
  isSubmitting.value = false;
};

const deleteEvent = async (id) => {
  if(confirm("Delete this event?")) { 
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
  if (userData.role === 'admin') fetchPendingUsers();
  
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
    console.log('Notification permission:', permission);

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

  // Method 2: Generate Google Calendar URL (optional - user can click to open)
  try {
    const eventTitle = encodeURIComponent(`${event.title} (${rsvpStatus === 'going' ? 'Going' : 'Not Going'})`);
    const eventDetails = encodeURIComponent(`SmartBand Event - ${event.location || 'TBA'}`);
    const startDateTime = dateTime.replace(/-/g, '').replace(/:/g, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${encodeURIComponent(event.location || '')}&dates=${startDateTime}/${startDateTime}`;
    
    // Store the URL for reference (could be used in a separate button)
    window.smartbandGoogleCalendarUrl = googleCalendarUrl;
  } catch (err) {
    console.error('Google Calendar URL error:', err);
  }

  // Method 3: Store in localStorage as backup reminder
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
  }
  

    
    
    // Remove duplicate if exists
    const filtered = reminders.filter(r => r.eventId !== event.id);
    filtered.push(reminder);
    localStorage.setItem('smartband_reminders', JSON.stringify(filtered));
    
    showToast('Event added to your calendar reminders!', 'success');

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
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const validateEventDate = () => {
  if (eventForm.value.date && new Date(eventForm.value.date) < new Date(getTodayDateString())) {
    showToast('Cannot schedule events in the past', 'error');
    eventForm.value.date = '';
  }
};
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
  if (notificationPermissionStatus.value === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icon.png' // Make sure you have an icon in your public folder
    });
  }
};

const setupRealtime = () => {
  realtimeChannel = supabase.channel('smartband-sync')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' }, (payload) => {
      if (activeTab.value === 'dashboard') loadDashboard();
      // Trigger notification for urgent posts
      if (payload.new.is_urgent && payload.new.author_id !== currentUser.value.id) {
        triggerBrowserNotification('Urgent Band Announcement!', payload.new.title);
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
      if (activeTab.value === 'roster') fetchRoster();
      if (activeTab.value === 'requests' && currentUser.value?.role === 'admin') fetchPendingUsers();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_posts' }, () => {
      if (activeTab.value === 'dashboard') loadDashboard();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
      if (activeTab.value === 'dashboard') loadDashboard();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_acknowledgments' }, () => {
      if (activeTab.value === 'dashboard') loadDashboard(); 
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps' }, () => {
      if (activeTab.value === 'dashboard') loadDashboard();
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

onMounted(() => {
  window.addEventListener('keydown', handleEscKey); 

  if(isLoggedIn.value) {
    myProfileForm.value = { firstName: currentUser.value.first_name, lastName: currentUser.value.last_name, instrument: currentUser.value.instrument };
    loadDashboard(); fetchRoster(); fetchMusicSheets();
    if (currentUser.value?.role === 'admin') fetchPendingUsers();
    
    sendHeartbeat();
    heartbeatInterval = setInterval(sendHeartbeat, 120000); 
    setupRealtime();
    
    // If user is already logged in (page refresh), still handle permissions if not done this session
    if (!userPermissionsHandled.value) {
      userPermissionsHandled.value = true;
      setTimeout(() => {
        const currentStatus = Notification?.permission || 'default';
        notificationPermissionStatus.value = currentStatus;
        
        if (currentStatus === 'default') {
          showNotificationPermissionModal.value = true;
        } else if (currentStatus === 'denied') {
          notificationPermissionDenied.value = true;
        } else if (currentStatus === 'granted') {
          setTimeout(() => showCalendarPermissionModal.value = true, 300);
        }
      }, 500);
    }
  }
});

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
  if (tab === 'requests' && currentUser.value?.role === 'admin') fetchPendingUsers();
});
</script>