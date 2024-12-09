const API_URL = window.location.origin;

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

async function loadPapers() {
    try {
        const response = await fetch(`${API_URL}/papers`);
        const papers = await response.json();

        const paperList = document.querySelector('.paper-list');
        paperList.innerHTML = papers.map(paper => `
            <div class="paper-item" onclick="loadPaper('${paper.id}')">
                ${paper.title}
            </div>
        `).join('');
    } catch (error) {
        alert('加载试卷列表失败');
    }
}

async function loadPaper(paperId) {
    try {
        const response = await fetch(`${API_URL}/papers/${paperId}`);
        const paper = await response.json();

        document.getElementById('paperContent').innerHTML = paper.content;
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