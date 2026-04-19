<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans text-gray-100 z-50">
    
    <div class="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(60,10,10,0.4)_0%,rgba(0,0,0,0)_60%)] pointer-events-none -z-10"></div>
    <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,197,24,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none -z-10"></div>

    <div class="w-full max-w-md bg-[#111111] border border-white/5 rounded-[24px] p-8 md:p-10 z-10 shadow-2xl text-center">
      
      <div class="flex justify-center items-center gap-3 text-2xl font-bold mb-8 text-white">
        <i class="fa-solid fa-music text-[#F5C518]"></i> SmartBand
      </div>

      <div class="flex bg-[#0a0a0a] rounded-xl p-1 mb-6 border border-white/5">
        <button @click="isLogin = true; errorMessage = ''; successMessage = ''" 
          :class="isLogin ? 'bg-[#222222] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'" 
          class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all">Sign In</button>
        <button @click="isLogin = false; errorMessage = ''; successMessage = ''" 
          :class="!isLogin ? 'bg-[#222222] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'" 
          class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all">Request Access</button>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-3 animate-pulse text-left">
        <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs font-bold flex items-center gap-3 text-left">
        <i class="fa-solid fa-circle-check"></i> {{ successMessage }}
      </div>

      <form @submit.prevent="handleAuth" class="flex flex-col gap-5 text-left">
        
        <div v-if="!isLogin" class="flex flex-col gap-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">First Name</label>
              <input v-model="firstName" type="text" placeholder="Juan" required
                class="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/50 transition-colors text-sm">
            </div>
            <div>
              <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Last Name</label>
              <input v-model="lastName" type="text" placeholder="Dela Cruz" required
                class="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/50 transition-colors text-sm">
            </div>
          </div>

          <div>
            <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Your Instrument</label>
            <select v-model="instrument" required
              class="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#F5C518]/50 transition-colors text-sm appearance-none">
              <option value="" disabled selected>Select your instrument...</option>
              <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
          <div class="relative">
            <i class="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input v-model="email" type="email" placeholder="you@example.com" required
              class="w-full bg-[#1a1a1a] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/50 transition-colors text-sm">
          </div>
        </div>

        <div>
          <div class="flex justify-between items-end mb-2 ml-1">
            <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <a v-if="isLogin" href="#" @click.prevent="handleResetPassword" class="text-[0.7rem] font-bold text-[#F5C518] hover:text-white transition-colors">Forgot?</a>
          </div>
          <div class="relative">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input v-model="password" @input="validatePassword" type="password" placeholder="••••••••" required
              class="w-full bg-[#1a1a1a] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/50 transition-colors text-sm">
          </div>
          <div v-if="!isLogin && password" class="mt-3 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg space-y-2">
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

        <button type="submit" :disabled="!isLogin && !isPasswordStrong" class="w-full bg-white text-black font-bold text-sm py-4 rounded-xl mt-2 hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
          {{ isLogin ? 'Access Dashboard' : 'Submit Registration' }} <i class="fa-solid fa-arrow-right"></i>
        </button>
        
        <p v-if="!isLogin" class="text-[0.65rem] text-center text-gray-500 mt-2 uppercase tracking-widest font-bold">
          Admin Approval Required
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue';
import { supabase } from '../supabase'; // Adjust path if your supabase.js is not in the parent folder

const isLogin = ref(true);
const emit = defineEmits(['login-success']);

// FORM REFS
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const instrument = ref('');

const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion', 'Staff/Support'];

// STATUS MESSAGES
const errorMessage = ref('');
const successMessage = ref('');
const isSubmitting = ref(false);

const passwordReqs = computed(() => {
  const p = password.value || ''; 
  return {
    hasLength: p.length >= 8,
    hasUppercase: /[A-Z]/.test(p), // Fixed name here!
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  };
});

const isPasswordStrong = computed(() => {
  return passwordReqs.value.hasLength && 
         passwordReqs.value.hasUppercase && // Fixed name here!
         passwordReqs.value.hasNumber && 
         passwordReqs.value.hasSpecial;
});

const handleResetPassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  if (!email.value) {
    errorMessage.value = 'Please enter your email address first.';
    return;
  }
  isSubmitting.value = true;
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: window.location.origin + window.location.pathname,
  });
  if (error) {
    errorMessage.value = error.message;
  } else {
    successMessage.value = 'Password reset link sent! Check your email.';
  }
  isSubmitting.value = false;
};

const handleAuth = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;

  if (isLogin.value) {
    // ==========================================
    // 1. LOGIN LOGIC
    // ==========================================
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (authError) {
      errorMessage.value = authError.message;
      isSubmitting.value = false;
      return;
    }

    // Fetch the user's details from your public.users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.value)
      .single();

    if (profileError || !profile) {
      errorMessage.value = "Profile data missing in the database.";
      await supabase.auth.signOut(); // Revert login
    } else if (profile.status === 'pending') {
      errorMessage.value = "Awaiting admin approval.";
      await supabase.auth.signOut(); // Revert login
    } else {
      // Success! Pass the custom profile to App.vue
      emit('login-success', profile); 
    }

  } else {
    // ==========================================
    // 2. REGISTRATION LOGIC
    // ==========================================
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          first_name: firstName.value,
          last_name: lastName.value,
          instrument: instrument.value
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        errorMessage.value = "Email already exists in records.";
      } else {
        errorMessage.value = authError.message;
      }
      isSubmitting.value = false;
      return;
    }

    if (authData?.user) {
      const { error: dbError } = await supabase.from('users').upsert({
        id: authData.user.id,
        email: email.value,
        first_name: firstName.value,
        last_name: lastName.value,
        instrument: instrument.value,
        role: 'member',
        status: 'pending',
        tier: 'junior'
      }, { onConflict: 'id' });
      if (dbError) {
        console.error("DB Insert Error", dbError);
      }
    }

    successMessage.value = "Request sent! Wait for Admin approval.";
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    password.value = '';
    instrument.value = '';
  }
  
  isSubmitting.value = false;
};
</script>