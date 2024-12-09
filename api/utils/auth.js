import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

export async function verify(username, password) {
    try {
        // 获取文件内容
        const result = await client.getFile('/users.json');
        if (!result) {
            console.error('users.json 不存在');
            return false;
        }

        // 转换Buffer为字符串
        const jsonString = Buffer.from(result).toString('utf8');
        console.log('获取到的JSON字符串:', jsonString); // 调试日志

        // 尝试解析JSON
        try {
            const users = JSON.parse(jsonString);
            const user = users.find(u =>
                u.username === username && u.password === password
            );
            return !!user;
        } catch (parseError) {
            console.error('JSON解析失败:', parseError);
            console.error('原始数据:', jsonString);
            return false;
        }
    } catch (error) {
        console.error('验证失败:', error);
        return false;
    }
}