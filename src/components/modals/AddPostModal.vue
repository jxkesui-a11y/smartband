<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
    <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl font-bold mb-4">New Post</h3>
      <input v-model="localForm.title" maxlength="100" placeholder="Title" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-4 text-sm text-white outline-none focus:border-[#F5C518]">
      <textarea v-model="localForm.message" maxlength="1000" placeholder="Message content..." class="w-full bg-black border border-white/10 rounded-xl p-4 mb-4 text-sm text-white outline-none h-24 md:h-32 focus:border-[#F5C518]"></textarea>
      <label class="flex items-center gap-2 text-sm text-white mb-6">
        <input type="checkbox" v-model="localForm.isUrgent" class="accent-[#F5C518]"> Mark as Urgent
      </label>
      <div class="flex gap-3 md:gap-4">
        <button @click="$emit('cancel')" class="flex-1 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold min-h-[44px]">Cancel</button>
        <button @click="$emit('submit', localForm)" :disabled="isSubmitting" class="flex-1 py-3 bg-[#F5C518] text-black rounded-xl text-[10px] uppercase font-bold min-h-[44px] disabled:opacity-50">
          <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-1"></i> Post
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  isSubmitting: Boolean,
});

const emit = defineEmits(['submit', 'cancel']);

const localForm = ref({ title: '', message: '', isUrgent: false });

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) localForm.value = { title: '', message: '', isUrgent: false };
});
</script>
