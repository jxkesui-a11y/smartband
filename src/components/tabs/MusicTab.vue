<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <h2 class="text-xl font-bold text-white uppercase tracking-widest">Score Repository</h2>
      <button v-if="canManageDashboard" @click="showUploadModal = true" class="bg-[#F5C518] text-black px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:ring-4 hover:ring-white/10 transition-all">
        <i class="fa-solid fa-cloud-arrow-up mr-2"></i> Upload Sheet
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-for="sheet in filteredSheets" :key="sheet.id" class="bg-[#111111] p-6 md:p-7 rounded-[28px] border border-white/5 flex items-center gap-4 md:gap-6">
        <div class="flex-1 text-left min-w-0">
          <h4 class="font-bold text-white text-base md:text-lg truncate">{{ sheet.title }}</h4>
          <p class="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-2">{{ sheet.instrument }}</p>
        </div>
        <div class="flex items-center gap-2">
          <a :href="sheet.file_path" target="_blank" class="text-xl text-[#F5C518] hover:scale-110 transition-transform p-2">
            <i class="fa-solid fa-download"></i>
          </a>
          <button v-if="canManageDashboard" @click="deleteSheet(sheet.id, sheet.file_path)" class="text-xl text-red-500 hover:scale-110 transition-transform p-2">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div class="bg-[#111111] border border-white/10 w-full max-w-md rounded-[44px] p-6 md:p-10 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Upload New Sheet</h3>
        <input v-model="uploadForm.title" maxlength="100" placeholder="Sheet Title" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518]">
        <select v-model="uploadForm.instrument" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-3 text-sm text-white outline-none focus:border-[#F5C518]">
          <option value="All">All Instruments</option>
          <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
        </select>
        <input type="file" @change="handleFileSelect" accept=".pdf,.mp3,.wav,.jpg,.png" class="w-full bg-black border border-white/10 rounded-xl p-4 mb-6 text-sm text-white outline-none focus:border-[#F5C518]">
        
        <div class="flex gap-3 md:gap-4">
          <button @click="showUploadModal = false; selectedFile = null" class="flex-1 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold min-h-[44px]">Cancel</button>
          <button @click="submitUpload" :disabled="isSubmitting || !selectedFile || !uploadForm.title" class="flex-1 py-3 bg-[#F5C518] text-black rounded-xl text-[10px] uppercase font-bold min-h-[44px] disabled:opacity-50">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-1"></i> Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';

const { filteredSheets, canManageDashboard, isSubmitting, uploadSheet, deleteSheet } = inject('smartband');
const showUploadModal = ref(false);
const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion'];
const selectedFile = ref(null);
const uploadForm = ref({ title: '', instrument: 'All' });

const handleFileSelect = (e) => {
  if (e.target.files.length > 0) {
    selectedFile.value = e.target.files[0];
  }
};

const submitUpload = async () => {
  await uploadSheet(selectedFile.value, uploadForm.value.title, uploadForm.value.instrument);
  showUploadModal.value = false;
  selectedFile.value = null;
  uploadForm.value = { title: '', instrument: 'All' };
};
</script>