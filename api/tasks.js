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
        const paperTasksMap = new Map();

        try {
            const result = await client.listDir('/tasks/');
            const files = result?.files || [];

            for (const file of files) {
                if (typeof file.name === 'string' && file.name.endsWith('.json')) {
                    try {
                        const taskContent = await client.getFile(`/tasks/${file.name}`);
                        const taskStr = typeof taskContent === 'string' ? taskContent : taskContent.toString();
                        const task = JSON.parse(taskStr);

                        if (userInfo.role === 'admin' || task.assignTo === userInfo.username) {
                            if (!paperTasksMap.has(task.paperId)) {
                                paperTasksMap.set(task.paperId, {
                                    paperId: task.paperId,
                                    assignees: [],
                                    assignedAt: task.assignedAt,
                                    currentUserAssigned: false,
                                    currentUserStatus: null
                                });
                            }

                            const paperTask = paperTasksMap.get(task.paperId);
                            paperTask.assignees.push({
                                username: task.assignTo,
                                assignedBy: task.assignedBy,
                                status: task.status
                            });

                            if (task.assignTo === userInfo.username) {
                                paperTask.currentUserAssigned = true;
                                paperTask.currentUserStatus = task.status;
                            }
                        }
                    } catch (fileError) {
                        console.error(`读取任务文件失败: ${file.name}`, fileError);
                        continue;
                    }
                }
            }

            const consolidatedTasks = Array.from(paperTasksMap.values()).map(task => ({
                ...task,
                status: task.currentUserAssigned ? task.currentUserStatus : 'pending'
            }));

            res.status(200).json(consolidatedTasks);

        } catch (listError) {
            if (listError.message?.includes('Not Found')) {
                return res.status(200).json([]);
            }
            throw listError;
        }

    } catch (error) {
        console.error('获取任务列表错误:', error);
        if (error.message === '未授权访问') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({
            message: '服务器错误',
            error: error.message
        });
    }
}