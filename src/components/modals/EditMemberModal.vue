<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
    <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 shadow-3xl text-left max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl md:text-2xl font-bold mb-6">Manage Member</h3>
      <div class="flex flex-col gap-4 md:gap-5">
        <div v-if="isAdmin">
          <label class="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">Email Address (Admin Only)</label>
          <input v-model="localUser.email" type="email" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
        </div>
        <div>
          <select v-model="localUser.role" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
            <option v-for="role in availableRoles" :key="role.value" :value="role.value" :disabled="role.disabled" :class="role.disabled ? 'opacity-50' : ''">
              {{ role.label }}{{ role.disabled ? ' (Already Assigned)' : '' }}
            </option>
          </select>
          <p v-if="assignedOfficerRoles.length > 0" class="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">
            <i class="fa-solid fa-info-circle mr-1"></i> Officer roles marked as assigned are already given to other members.
          </p>
        </div>
        <select v-model="localUser.tier" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white capitalize outline-none focus:border-[#F5C518]">
          <option value="senior">Senior Musician</option>
          <option value="junior">Junior Musician</option>
          <option value="none">Staff / Non-Player</option>
        </select>
        <select v-model="localUser.instrument" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
          <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
        </select>
        <div class="flex gap-3 md:gap-4 pt-4 md:pt-6">
          <button @click="$emit('cancel')" :disabled="isSubmitting" class="flex-1 py-4 md:py-5 border border-white/10 rounded-[20px] text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 min-h-[44px]">Cancel</button>
          <button @click="$emit('save', localUser)" :disabled="isSubmitting" class="flex-1 py-4 md:py-5 bg-[#F5C518] text-black rounded-[20px] font-bold text-[10px] uppercase tracking-widest min-h-[44px]">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-2"></i>{{ isSubmitting ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Object, default: null },
  isSubmitting: Boolean,
  availableRoles: { type: Array, default: () => [] },
  assignedOfficerRoles: { type: Array, default: () => [] },
  instrumentList: { type: Array, default: () => [] },
  isAdmin: Boolean,
});

defineEmits(['save', 'cancel']);

const localUser = ref(props.modelValue ? { ...props.modelValue } : {});

watch(() => props.modelValue, (val) => {
  if (val) localUser.value = { ...val };
});
</script>
