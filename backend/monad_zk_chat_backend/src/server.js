const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const staticPlugin = require('@fastify/static');
const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

// 留言存储文件
const MESSAGES_FILE = path.join(__dirname, '../messages.json');

// 初始化 messages.json
async function initMessagesFile() {
    try {
        await fs.access(MESSAGES_FILE);
    } catch {
        await fs.writeFile(MESSAGES_FILE, JSON.stringify([]));
    }
}

// 注册 CORS
fastify.register(cors, {
    origin: '*', // 允许所有来源，生产环境可限制为前端域名
});

// 注册静态文件（可选，若需托管前端）
fastify.register(staticPlugin, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
});

// 登录 API
fastify.post('/login', async (request, reply) => {
    const { address, message, signature } = request.body;
    try {
        if (!address || !message || !signature) {
            return reply.code(400).send({ error: '缺少必要字段' });
        }
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return reply.code(401).send({ error: '签名验证失败' });
        }
        // 假设会话存储到 Redis（此处仅验证）
        fastify.log.info(`用户 ${address} 登录成功`);
        return reply.code(200).send({ success: true });
    } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: '服务器错误' });
    }
});

// 获取留言
fastify.get('/messages', async (request, reply) => {
    try {
        const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
        const messages = JSON.parse(data);
        return reply.code(200).send(messages);
    } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: '获取留言失败' });
    }
});

// 保存留言
fastify.post('/messages', async (request, reply) => {
    const { sender, content, timestamp } = request.body;
    if (!sender || !content || !timestamp) {
        return reply.code(400).send({ error: '缺少必要字段' });
    }
    try {
        const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
        const messages = JSON.parse(data);
        messages.push({ sender, content, timestamp });
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        fastify.log.info(`新留言 from ${sender}`);
        return reply.code(200).send({ success: true });
    } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: '保存留言失败' });
    }
});

// 启动服务器
const start = async () => {
    try {
        await initMessagesFile();
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        fastify.log.info('Server running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();