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

    if (req.method !== 'POST') {
        return res.status(405).json({ message: '不支持的请求方法' });
    }

    try {
        const userInfo = validateToken(req);

        const { paperId, score, comment } = req.body;

        if (!paperId || !score) {
            return res.status(400).json({ message: '缺少必要参数' });
        }

        const scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
            return res.status(400).json({ message: '分数格式不正确' });
        }

        const gradeData = {
            paperId,
            score: scoreNum,
            comment: comment || '',
            timestamp: new Date().toISOString(),
            gradedBy: {
                username: userInfo.username,
                role: userInfo.role,
                name: userInfo.name,
                studentId: userInfo.studentId
            }
        };

        const gradePath = `/grades/${paperId.replace(/\//g, '_')}.json`;
        await client.putFile(gradePath, Buffer.from(JSON.stringify(gradeData)));

        res.status(200).json({ message: '评分保存成功' });

    } catch (error) {
        console.error('评分错误:', error);
        if (error.message === '未授权访问') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: '服务器错误' });
    }
}