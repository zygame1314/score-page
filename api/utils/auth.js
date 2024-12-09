import UPYUN from 'upyun';

// 使用又拍云推荐的初始化方式
const service = new UPYUN.Service({
    serviceName: process.env.UPYUN_SERVICE_NAME,
    operator: process.env.UPYUN_OPERATOR_NAME,  // 注意这里是 operator 而不是 operatorName
    password: process.env.UPYUN_OPERATOR_PASSWORD
});

const client = new UPYUN.Client(service);

// 添加更详细的测试
export async function testUpyunConnection() {
    try {
        console.log('正在测试连接...');
        console.log('配置信息:', {
            serviceName: process.env.UPYUN_SERVICE_NAME,
            operator: process.env.UPYUN_OPERATOR_NAME
        });

        // 使用 usage 接口测试连接
        const usage = await client.usage();
        console.log('存储使用量:', usage);

        // 如果能获取到使用量，说明连接成功
        return true;
    } catch (error) {
        console.error('连接测试失败:', {
            message: error.message,
            code: error.code,
            requestId: error?.requestId,
            detail: error
        });
        return false;
    }
}