export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const papers = await upyun.get('/papers/list.json');
            res.status(200).json(JSON.parse(papers));
        } catch (error) {
            res.status(500).json({ message: '获取试卷列表失败' });
        }
    }
}