import { verify } from './utils/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '方法不允许' });
    }

    const { username, password } = req.body;

    try {
        const isValid = await verify(username, password);
        if (isValid) {
            const token = Math.random().toString(36).substring(7);

            res.status(200).json({
                token,
                message: '登录成功'
            });
        } else {
            res.status(401).json({ message: '用户名或密码错误' });
        }
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
}