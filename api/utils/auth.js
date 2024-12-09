import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

export async function verify(username, password) {
    try {
        const result = await client.getFile('/users.json');
        if (!result) {
            throw new Error('users.json 不存在');
        }

        // 添加调试输出
        console.log('原始数据:', result);
        console.log('数据类型:', typeof result);

        // 如果result是Buffer，转换为字符串
        const jsonString = Buffer.isBuffer(result) ? result.toString('utf8') : result;
        console.log('转换后的字符串:', jsonString);

        // 尝试解析JSON
        const users = JSON.parse(jsonString);

        const user = users.find(u =>
            u.username === username && u.password === password
        );

        return !!user;
    } catch (error) {
        console.error('验证失败:', {
            message: error.message,
            stack: error.stack,
            data: result
        });
        return false;
    }
}