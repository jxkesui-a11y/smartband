<template>
        <div class="flex flex-col bg-[#111111] rounded-[32px] p-4 md:p-6 border border-white/5 h-[calc(100vh-10rem)] md:h-[600px] shadow-inner relative">
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
</template>

<script setup>
import { inject } from 'vue';
const { chatMessages, newMessageContent, sendMessage, isSubmitting, selectedChannel, currentUser } = inject('smartband');
</script>