<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps(['address']);
const messages = ref([]);
const newMessage = ref('');
const error = ref(null);

function truncateAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

async function fetchMessages() {
  try {
    const response = await axios.get('/messages');
    messages.value = response.data;
  } catch (err) {
    error.value = '获取留言失败: ' + err.message;
  }
}

async function sendMessage() {
  if (!newMessage.value.trim()) return;
  try {
    await axios.post('/messages', {
      sender: props.address, // 修复：使用 props.address
      content: newMessage.value,
      timestamp: new Date().toISOString(),
    });
    newMessage.value = '';
    await fetchMessages(); // 刷新留言列表
  } catch (err) {
    error.value = '发送留言失败: ' + err.message;
  }
}

onMounted(fetchMessages);
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
    <h2 class="text-xl font-bold mb-4">留言板（你的地址: {{ truncateAddress(props.address) }}）</h2>
    <div class="h-96 overflow-y-auto border p-4 mb-4">
      <div v-for="(msg, index) in messages" :key="index" class="mb-2">
        <span class="font-semibold">{{ truncateAddress(msg.sender) }}</span>
        <span class="text-gray-500 text-sm ml-2">
          {{ new Date(msg.timestamp).toLocaleString('zh-CN') }}
        </span>
        <p class="mt-1">{{ msg.content }}</p>
      </div>
      <p v-if="error" class="text-red-500">{{ error }}</p>
    </div>
    <div class="flex">
      <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          class="flex-1 border p-2 rounded-l"
          placeholder="输入留言..."
      />
      <button
          @click="sendMessage"
          class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
      >
        发布
      </button>
    </div>
  </div>
</template>