<template>
        <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] xl:grid-cols-[1.5fr_1fr] gap-6 md:gap-8">
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
</template>

<script setup>
import { inject } from 'vue';
const { dashboardPosts, dashboardEvents, canManageDashboard, showAddPostModal, deletePost, formatDate, hasAcknowledged, acknowledgePost, getAckCount, showAddEventModal, deleteEvent, formatMonth, formatDay, submitRSVP, getUserRSVP, getRSVPStats, toggleAttendeesList, expandedEventId, getAttendeesList } = inject('smartband');
</script>