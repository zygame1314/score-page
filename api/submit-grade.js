export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '方法不允许' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: '未授权' });
    }

    try {
        const { paperId, score, comment } = req.body;

        const gradeData = {
            paperId,
            score,
            comment,
            timestamp: new Date().toISOString()
        };

        await upyun.put(`/grades/${paperId}.json`, JSON.stringify(gradeData));

        res.status(200).json({ message: '评分保存成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
}