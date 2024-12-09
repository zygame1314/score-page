import { UPYun } from 'upyun';

const upyun = new UPYun({
    serviceName: process.env.UPYUN_SERVICE_NAME,
    operatorName: process.env.UPYUN_OPERATOR_NAME,
    password: process.env.UPYUN_OPERATOR_PASSWORD
});

export async function verify(username, password) {
    try {
        const users = await upyun.get('/users.json');
        const userList = JSON.parse(users);

        const user = userList.find(u =>
            u.username === username && u.password === password
        );

        return !!user;
    } catch (error) {
        console.error('验证失败:', error);
        return false;
    }
}