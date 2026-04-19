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
        <div class="flex gap-3 md:gap-4 pt-4 md:pt-6">
          <button @click="$emit('cancel')" class="flex-1 py-4 md:py-5 border border-white/10 rounded-[20px] text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 min-h-[44px]">Cancel</button>
          <button @click="handleUpdate" class="flex-1 py-4 md:py-5 bg-[#F5C518] text-black rounded-[20px] font-bold text-[10px] uppercase tracking-widest min-h-[44px]">Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  form: { type: Object, default: () => ({ firstName: '', lastName: '', instrument: '' }) },
  instrumentList: { type: Array, default: () => [] },
});

const emit = defineEmits(['update', 'cancel']);

const localForm = ref({ ...props.form });

watch(() => props.form, (val) => { localForm.value = { ...val }; }, { deep: true });

const handleUpdate = () => {
  if (!localForm.value.firstName?.trim() || !localForm.value.lastName?.trim()) return;
  emit('update', { ...localForm.value });
};
</script>
