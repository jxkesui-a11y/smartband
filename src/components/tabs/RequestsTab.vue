<template>
        <div class="max-w-4xl mx-auto flex flex-col gap-6 animate-in slide-in-from-top-4 duration-500">
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
        <p class="text-[11px] text-gray-600 mt-1"><i class="fa-regular fa-envelope mr-1"></i>{{ user.email }}</p>
      </div>
    </div>
    
    <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
      <button @click="declineUser(user.id)" class="bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 px-6 md:px-8 py-3 md:py-4 rounded-[22px] text-xs font-bold uppercase tracking-widest hover:bg-[#FF453A]/20 transition-colors min-h-[44px]">
        Delete Request
      </button>
      <button @click="approveUser(user.id)" class="bg-[#32D74B] text-black px-8 md:px-12 py-3 md:py-4 rounded-[22px] text-xs font-bold uppercase tracking-widest hover:bg-[#28b33e] transition-colors min-h-[44px]">
        Grant Access
      </button>
    </div>

  </div>
</div>
</template>

<script setup>
import { inject } from 'vue';
const { pendingUsers, declineUser, approveUser } = inject('smartband');
</script>