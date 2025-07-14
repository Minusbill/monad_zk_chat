<script setup>
import { ref } from 'vue';
import Login from './components/Login.vue';
import MessageBoard from './components/MessageBoard.vue';

const address = ref(null);

function handleLogin(newAddress) {
  address.value = newAddress;
}
</script>

<template>
  <div class="min-h-screen bg-purple-900 flex flex-col">
    <!-- Banner（仅图片） -->
    <div class="w-full h-48 bg-cover bg-center" style="background-image: url('/banner.png')"></div>
    <!-- 主内容 -->
    <div class="flex-1 flex items-center justify-center">
      <Login v-if="!address" @login-success="handleLogin" />
      <MessageBoard v-else :address="address" />
    </div>
  </div>
</template>