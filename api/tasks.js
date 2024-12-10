import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: '不支持的请求方法' });
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('未授权访问');
        }

        const userInfo = JSON.parse(Buffer.from(token, 'base64').toString());

        const tasks = [];
        const list = await client.listDir('/tasks/');

        for (const file of list) {
            if (file.name.endsWith('.json')) {
                const taskContent = await client.getFile(`/tasks/${file.name}`);
                const task = JSON.parse(taskContent);

                if (userInfo.role === 'admin' || task.assignTo === userInfo.username) {
                    tasks.push(task);
                }
            }
        }

        res.status(200).json(tasks);

    } catch (error) {
        console.error('获取任务列表错误:', error);
        if (error.message === '未授权访问') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: '服务器错误' });
    }
}