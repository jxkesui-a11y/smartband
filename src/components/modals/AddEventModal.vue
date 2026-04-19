<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
    <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl font-bold mb-4">New Event</h3>
      <input v-model="localForm.title" maxlength="100" placeholder="Event Name" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518]">
      <input type="date" v-model="localForm.date" :min="todayStr" style="color-scheme: dark;" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518] cursor-pointer" @change="validateDate">
      <input type="time" v-model="localForm.time" required style="color-scheme: dark;" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518] cursor-pointer">
      <p v-if="isDateInvalid" class="text-[#FF453A] text-[10px] mb-2">❌ Cannot schedule events in the past</p>
      <input v-model="localForm.location" maxlength="150" placeholder="Location" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-6 text-sm text-white outline-none focus:border-[#F5C518]">
      <div class="flex gap-3 md:gap-4">
        <button @click="$emit('cancel')" class="flex-1 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold min-h-[44px]">Cancel</button>
        <button @click="$emit('submit', localForm)" :disabled="isSubmitting || !localForm.date || !localForm.time || isDateInvalid" class="flex-1 py-3 bg-[#F5C518] text-black rounded-xl text-[10px] uppercase font-bold min-h-[44px] disabled:opacity-50">
          <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-1"></i> Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  isSubmitting: Boolean,
});

const emit = defineEmits(['submit', 'cancel']);

const localForm = ref({ title: '', date: '', time: '', location: '' });

// Today's date string for the :min attribute
const todayStr = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

// Invalid if selected datetime is more than 1 minute in the past
const isDateInvalid = computed(() => {
  if (!localForm.value.date || !localForm.value.time) return false;
  const selected = new Date(`${localForm.value.date}T${localForm.value.time}`);
  return selected < new Date(Date.now() - 60000);
});

const validateDate = () => {
  if (localForm.value.date < todayStr.value) {
    localForm.value.date = '';
  }
};

// Reset when modal opens
watch(() => props.show, (val) => {
  if (val) localForm.value = { title: '', date: '', time: '', location: '' };
});
</script>
