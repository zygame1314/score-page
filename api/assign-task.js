import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

const validateToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new Error('未授权访问');
    }
    try {
        const userInfo = JSON.parse(Buffer.from(token, 'base64').toString());
        if (userInfo.role !== 'admin') {
            throw new Error('权限不足');
        }
        return userInfo;
    } catch (error) {
        throw new Error('无效的 token');
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '不支持的请求方法' });
    }

    try {
        const userInfo = validateToken(req);
        const { paperId, assignTo } = req.body;

        if (!paperId || !Array.isArray(assignTo) || assignTo.length === 0) {
            return res.status(400).json({ message: '参数错误' });
        }

        const taskPath = `/tasks/${paperId.replace(/\//g, '_')}.json`;
        let task;

        try {
            const existingContent = await client.getFile(taskPath);
            task = JSON.parse(existingContent);
        } catch (error) {
            task = {
                paperId,
                assignees: [],
                createdAt: new Date().toISOString()
            };
        }

        if (!Array.isArray(task.assignees)) {
            task.assignees = [];
        }

        assignTo.forEach(username => {
            if (!task.assignees.some(a => a.username === username)) {
                task.assignees.push({
                    username,
                    assignedBy: userInfo.username,
                    assignedAt: new Date().toISOString(),
                    status: 'pending'
                });
            }
        });

        await client.putFile(taskPath, Buffer.from(JSON.stringify(task)));

        res.status(200).json({ message: '任务分配成功' });

    } catch (error) {
        console.error('任务分配错误:', error);
        if (error.message === '未授权访问' || error.message === '权限不足') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: '服务器错误' });
    }
}