import { verify } from './utils/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ message: '不支持的请求方法' });
        return;
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
        res.status(400).json({ message: '缺少必要参数' });
        return;
    }

    try {
        const user = await verify(username, password);
        if (user) {
            const token = Buffer.from(JSON.stringify({
                username: user.username,
                role: user.role,
                name: user.name,
                studentId: user.studentId,
                timestamp: Date.now()
            })).toString('base64');

            res.status(200).json({
                token,
                message: '登录成功'
            });
        } else {
            res.status(401).json({ message: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}