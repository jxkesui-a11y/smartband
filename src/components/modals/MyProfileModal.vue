<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
    <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 shadow-3xl text-left max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl md:text-2xl font-bold mb-6 text-white">Edit My Profile</h3>
      <div class="flex flex-col gap-4 md:gap-5">
        <div>
          <label class="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">First Name</label>
          <input v-model="localForm.firstName" maxlength="50" type="text" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">Last Name</label>
          <input v-model="localForm.lastName" maxlength="50" type="text" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">Instrument</label>
          <select v-model="localForm.instrument" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
            <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
          </select>
        </div>

        <div class="border-t border-white/10 mt-2 pt-4">
          <h4 class="text-sm font-bold text-white mb-4">Change Password</h4>
          <div class="flex flex-col gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">Current Password</label>
              <input v-model="passwords.current" type="password" placeholder="Leave blank to keep current" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
            </div>
            <div v-if="passwords.current">
              <label class="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">New Password</label>
              <input v-model="passwords.new" type="password" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
              
              <div v-if="passwords.new" class="mt-3 p-3 bg-black border border-white/10 rounded-lg space-y-2">
                <p class="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-2">Password Requirements:</p>
                <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasLength ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordReqs.hasLength ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
                  <span>At least 8 characters</span>
                </div>
                <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasUppercase ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordReqs.hasUppercase ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
                  <span>One uppercase letter (A-Z)</span>
                </div>
                <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasNumber ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordReqs.hasNumber ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
                  <span>One number (0-9)</span>
                </div>
                <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasSpecial ? 'text-green-500' : 'text-gray-500'">
                  <i :class="passwordReqs.hasSpecial ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
                  <span>One special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
            <div v-if="passwords.current">
              <label class="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-1">Confirm New Password</label>
              <input v-model="passwords.confirm" type="password" class="w-full bg-black border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm text-white outline-none focus:border-[#F5C518]">
              <p v-if="passwords.confirm && passwords.new !== passwords.confirm" class="text-red-500 text-[10px] mt-1 ml-1 font-bold">Passwords do not match.</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 md:gap-4 pt-4 md:pt-6">
          <button @click="$emit('cancel')" class="flex-1 py-4 md:py-5 border border-white/10 rounded-[20px] text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 min-h-[44px]">Cancel</button>
          <button @click="handleUpdate" :disabled="isUpdateDisabled" class="flex-1 py-4 md:py-5 bg-[#F5C518] text-black rounded-[20px] font-bold text-[10px] uppercase tracking-widest min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed">Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  show: Boolean,
  form: { type: Object, default: () => ({ firstName: '', lastName: '', instrument: '' }) },
  instrumentList: { type: Array, default: () => [] },
});

const emit = defineEmits(['update', 'cancel']);

const localForm = ref({ ...props.form });
const passwords = ref({ current: '', new: '', confirm: '' });

watch(() => props.show, (val) => {
  if (val) passwords.value = { current: '', new: '', confirm: '' };
});

watch(() => props.form, (val) => { localForm.value = { ...val }; }, { deep: true });

const passwordReqs = computed(() => {
  const p = passwords.value.new || ''; 
  return {
    hasLength: p.length >= 8,
    hasUppercase: /[A-Z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  };
});

const isPasswordStrong = computed(() => {
  return passwordReqs.value.hasLength && 
         passwordReqs.value.hasUppercase &&
         passwordReqs.value.hasNumber && 
         passwordReqs.value.hasSpecial;
});

const isUpdateDisabled = computed(() => {
  if (!localForm.value.firstName?.trim() || !localForm.value.lastName?.trim()) return true;
  if (passwords.value.current) {
    if (!isPasswordStrong.value) return true;
    if (passwords.value.new !== passwords.value.confirm) return true;
  }
  return false;
});

const handleUpdate = () => {
  if (isUpdateDisabled.value) return;
  emit('update', { ...localForm.value, passwords: passwords.value });
};
</script>
