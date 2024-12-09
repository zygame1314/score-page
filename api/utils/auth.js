import UPYUN from 'upyun';

// 修改服务初始化方式
const service = new UPYUN({
    serviceName: process.env.UPYUN_SERVICE_NAME,
    operatorName: process.env.UPYUN_OPERATOR_NAME,
    password: process.env.UPYUN_OPERATOR_PASSWORD,
    domain: 'v0.api.upyun.com' // 添加 API 域名
});

export async function testUpyunConnection() {
    try {
        console.log('开始测试连接...');

        // 使用 REST API 方式测试连接
        const result = await service.listDir('/');
        console.log('目录列表:', result);
        return true;
    } catch (error) {
        console.error('连接测试详细信息:', {
            message: error.message,
            code: error.code,
            status: error.status,
            response: error.response
        });
        return false;
    }
}

export async function verify(username, password) {
    try {
        // 直接使用 service 实例
        const result = await service.getFile('/users.json');
        console.log('获取到的文件内容:', result);

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