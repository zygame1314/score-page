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
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: '不支持的请求方法' });
    }

    try {
        validateToken(req);

        const result = await client.getFile('/users.json');
        if (!result) {
            return res.status(404).json({ message: '用户数据不存在' });
        }

        const users = Array.isArray(result) ? result : [result];

        const filteredUsers = users.map(user => ({
            username: user.username,
            name: user.name,
            role: user.role
        }));

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error('获取用户列表错误:', error);
        if (error.message === '未授权访问' || error.message === '权限不足') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: '服务器错误' });
    }
}