<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps(['address']);
const messages = ref([]);
const newMessage = ref('');
let ws = null;

function truncateAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:3000/chat/1'); // 假设活动 ID 为 1
  ws.onopen = () => console.log('WebSocket 连接成功');
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    messages.value.push(msg);
    // 5 分钟自毁
    setTimeout(() => {
      messages.value = messages.value.filter((m) => m !== msg);
    }, 5 * 60 * 1000);
  };
  ws.onerror = (err) => console.error('WebSocket 错误:', err);
  ws.onclose = () => console.log('WebSocket 关闭');
}

function sendMessage() {
  if (newMessage.value.trim() && ws?.readyState === WebSocket.OPEN) {
    const msg = { sender: props.address, content: newMessage.value };
    ws.send(JSON.stringify(msg));
    newMessage.value = '';
  }
}

onMounted(connectWebSocket);
onUnmounted(() => ws?.close());
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
    <h2 class="text-xl font-bold mb-4">聊天室（你的地址: {{ truncateAddress(address) }}）</h2>
    <div class="h-96 overflow-y-auto border p-4 mb-4">
      <div v-for="(msg, index) in messages" :key="index" class="mb-2">
        <span class="font-semibold">{{ truncateAddress(msg.sender) }}: </span>
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <div class="flex">
      <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          class="flex-1 border p-2 rounded-l"
          placeholder="输入消息..."
      />
      <button
          @click="sendMessage"
          class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
      >
        发送
      </button>
    </div>
  </div>
</template>