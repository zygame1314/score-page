const API_URL = window.location.origin;
let currentPaperId = null;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // 保存token到localStorage
            localStorage.setItem('token', data.token);

            // 切换页面
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('gradingPage').classList.remove('hidden');
            loadPapers();
        } else {
            alert(data.message || '登录失败');
        }
    } catch (error) {
        alert('登录失败，请检查网络连接');
    }
});

async function getAllFiles(path) {
    let allFiles = [];
    let response = await fetch(`/api/papers?path=${encodeURIComponent(path)}`);
    let data = await response.json();

    if (!data || !data.files) {
        return [];
    }

    allFiles = allFiles.concat(data.files);

    while (data && data.next) {
        response = await fetch(`/api/papers?path=${encodeURIComponent(path)}&iter=${data.next}`);
        data = await response.json();
        if (data && data.files) {
            allFiles = allFiles.concat(data.files);
        }
    }

    return allFiles;
}

const structureCache = new Map();

async function buildStructure(path = '/papers') {
    console.log('Building structure for:', path);

    if (structureCache.has(path)) {
        return structureCache.get(path);
    }

    const files = await getAllFiles(path);
    console.log('Files received:', files);

    const result = {};

    for (const item of files) {
        if (item.type === 'F') {
            const subPath = path + '/' + item.name;
            result[item.name] = await buildStructure(subPath);
        } else {
            if (!result.files) result.files = [];
            result.files.push({
                id: path.replace('/papers/', '') + '/' + item.name,
                title: item.name
            });
        }
    }

    structureCache.set(path, result);
    return result;
}

async function loadPapers() {
    try {
        const paperList = document.querySelector('.paper-list');
        paperList.innerHTML = '<p>加载中...</p>';

        console.log('开始加载文件结构...');
        const structure = await buildStructure();
        console.log('文件结构:', structure);

        const papers = {};

        // 转换数据结构
        for (const subject in structure) {
            if (subject === 'files') continue; // 跳过根目录下的文件
            papers[subject] = {};
            for (const className in structure[subject]) {
                if (className === 'files') continue;
                papers[subject][className] = structure[subject][className].files || [];
            }
        }

        console.log('处理后的数据结构:', papers);

        let html = '';
        const isEmpty = Object.keys(papers).length === 0;

        if (isEmpty) {
            html = '<p>暂无试卷</p>';
        } else {
            for (const [subject, classes] of Object.entries(papers)) {
                html += `<div class="subject-group">
                    <h3>${subject}</h3>`;

                for (const [className, files] of Object.entries(classes)) {
                    if (files && files.length > 0) {
                        html += `<div class="class-group">
                            <h4>${className}</h4>`;

                        files.forEach(file => {
                            html += `<div class="paper-item" 
                                onclick="loadPaper('${file.id}')">
                                ${file.title}
                            </div>`;
                        });

                        html += `</div>`;
                    }
                }

                html += `</div>`;
            }
        }

        paperList.innerHTML = html;
    } catch (error) {
        console.error('加载失败:', error);
        document.querySelector('.paper-list').innerHTML =
            '<p>加载试卷列表失败</p>';
    }
}

async function loadPaper(paperId) {
    try {
        const response = await fetch(`/api/papers?id=${paperId}`);
        const paper = await response.json();

        const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(paper.fileUrl)}`;

        document.getElementById('paperContent').innerHTML = `
            <iframe 
                src="${viewerUrl}" 
                width="100%" 
                height="600px" 
                frameborder="0">
            </iframe>
        `;

        currentPaperId = paperId;
    } catch (error) {
        alert('加载试卷内容失败');
    }
}

document.getElementById('submitGrade').addEventListener('click', async () => {
    const score = document.getElementById('score').value;
    const comment = document.getElementById('comment').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/submit-grade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                paperId: currentPaperId,
                score,
                comment
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert('评分提交成功');
        } else {
            alert(data.message || '提交失败');
        }
    } catch (error) {
        alert('提交失败，请检查网络连接');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('gradingPage').classList.add('hidden');
});