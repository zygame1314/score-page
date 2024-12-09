import UPYUN from 'upyun';

const service = new UPYUN({
    serviceName: process.env.UPYUN_SERVICE_NAME,
    operatorName: process.env.UPYUN_OPERATOR_NAME,
    password: process.env.UPYUN_OPERATOR_PASSWORD,
    domain: 'v0.api.upyun.com' // 添加 API 域名
});

const client = new UPYUN.Client(service);

export async function testUpyunConnection() {
    try {
        console.log('正在测试连接...');
        console.log('配置信息:', {
            serviceName: process.env.UPYUN_SERVICE_NAME,
            operatorName: process.env.UPYUN_OPERATOR_NAME,
            hasPassword: !!process.env.UPYUN_OPERATOR_PASSWORD
        });

        // 使用最简单的操作测试连接
        const usage = await service.usage();
        console.log('存储使用情况:', usage);

        return true;
    } catch (error) {
        console.error('连接测试失败:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            headers: error.response?.headers
        });
        return false;
    }
}

export async function verify(username, password) {
    try {
        const result = await client.getFile('/users.json');
        console.log('读取到的用户文件:', result.toString());

        const users = JSON.parse(result);
        return users.some(user =>
            user.username === username &&
            user.password === password
        );
    } catch (error) {
        console.error('验证失败:', error);
        return false;
    }
}