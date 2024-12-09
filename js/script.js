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

// ...existing code...

async function loadPapers() {
    try {
        const response = await fetch('/api/papers');
        const subjects = await response.json();
        
        const paperList = document.querySelector('.paper-list');
        let html = '';
        
        for (const subject of subjects.files) {
            html += `<div class="subject-group">
                <h3 class="folder" data-path="${subject.name}" onclick="loadFolder(this, '${subject.name}')">${subject.name}</h3>
                <div class="folder-content hidden"></div>
            </div>`;
        }
        
        paperList.innerHTML = html;
    } catch (error) {
        alert('加载文件夹列表失败');
    }
}

async function loadFolder(element, path) {
    const contentDiv = element.nextElementSibling;
    
    // 如果已经加载过并且是隐藏状态,直接切换显示
    if(contentDiv.children.length > 0) {
        contentDiv.classList.toggle('hidden');
        return;
    }
    
    try {
        const response = await fetch(`/api/papers?path=${encodeURIComponent(path)}`);
        const data = await response.json();
        
        let html = '';
        if(data.files) {
            for(const item of data.files) {
                if(item.type === 'F') {
                    // 是文件夹
                    html += `<div class="class-group">
                        <h4 class="folder" onclick="loadFolder(this, '${path}/${item.name}')">${item.name}</h4>
                        <div class="folder-content hidden"></div>
                    </div>`;
                } else {
                    // 是文件
                    html += `<div class="paper-item" onclick="loadPaper('${path}/${item.name}')">
                        ${item.name}
                    </div>`;
                }
            }
        }
        
        contentDiv.innerHTML = html;
        contentDiv.classList.remove('hidden');
    } catch (error) {
        alert('加载文件夹内容失败');
    }
}

// ...existing code...

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