import fetch from 'node-fetch';

const WHUT_SSO_URL = 'https://zhlgd.whut.edu.cn/tpass/login';

export async function verify(username, password) {
    try {
        const response = await fetch(WHUT_SSO_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'username': username,
                'password': password,
            })
        });

        if (!response.ok) {
            throw new Error('统一认证平台验证失败');
        }

        const data = await response.json();
        return {
            isValid: true,
            studentId: data.studentId,
            name: data.name,
            department: data.department
        };
    } catch (error) {
        console.error('验证失败:', error);
        return {
            isValid: false
        };
    }
}