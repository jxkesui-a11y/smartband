<template>
        <div class="bg-[#111111] border border-white/5 rounded-[32px] overflow-hidden shadow-3xl overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-white/5 text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">
              <tr>
                <th class="px-4 md:px-8 py-4 md:py-5">Name</th>
                <th class="px-4 md:px-8 py-4 md:py-5 hidden md:table-cell">Position</th>
                <th class="px-4 md:px-8 py-4 md:py-5 hidden md:table-cell">Instrument</th>
                <th class="px-4 md:px-8 py-4 md:py-5">Status</th>
                <th v-if="['admin', 'president', 'vp'].includes(currentUser?.role)" class="px-4 md:px-8 py-4 md:py-5 text-right pr-6 md:pr-12">Action</th>
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
                <td v-if="['admin', 'president', 'vp'].includes(currentUser?.role)" class="px-4 md:px-8 py-4 md:py-6 text-right pr-6 md:pr-12">
                  <div class="flex justify-end gap-2">
                    <button v-if="currentUser?.role?.toLowerCase() === 'admin' || (user.role && user.role.toLowerCase() !== 'admin')" @click="openEditModal(user)" class="text-[10px] font-bold bg-white/5 px-3 py-2 md:px-4 rounded-xl uppercase hover:bg-[#F5C518] hover:text-black transition-all border border-white/5 min-h-[44px]">Edit</button>
                    <button v-if="user.id !== currentUser.id && (currentUser?.role?.toLowerCase() === 'admin' || (user.role && user.role.toLowerCase() !== 'admin'))" @click="deleteUser(user.id)" class="text-[10px] font-bold bg-white/5 px-3 py-2 md:px-4 rounded-xl uppercase hover:bg-red-500 hover:text-white transition-all border border-white/5 min-h-[44px]"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
</template>

<script setup>
import { inject } from 'vue';
const { roster, currentUser, isOnline, openEditModal, deleteUser } = inject('smartband');
</script>