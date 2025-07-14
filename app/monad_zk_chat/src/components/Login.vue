<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';

const isMetaMaskInstalled = ref(!!window.ethereum);
const error = ref(null);
const emit = defineEmits(['login-success']);

async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error('请安装 MetaMask');
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const message = 'Login to Monad Activity Platform';
    const signature = await signer.signMessage(message);

    // 使用相对路径调用后端
    const response = await fetch('/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({address, message, signature}),
    });

    if (!response.ok) throw new Error('登录失败');
    emit('login-success', address);
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-lg text-center">
    <h1 class="text-2xl font-bold mb-4">Monad 活动平台</h1>
    <button
        @click="connectWallet"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        :disabled="!isMetaMaskInstalled"
    >
      {{ isMetaMaskInstalled ? '使用 MetaMask 登录' : '请安装 MetaMask' }}
    </button>
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
  </div>
</template>