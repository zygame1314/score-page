let paperTasks = {};

async function loadPaperTasks() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const tasks = await response.json();
        paperTasks = tasks.reduce((acc, task) => {
            acc[task.paperId] = task;
            return acc;
        }, {});
    } catch (error) {
        console.error('加载任务状态失败', error);
    }
}

async function loadPapers() {
    try {
        await loadPaperTasks();
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/papers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const subjects = await response.json();

        const paperList = document.querySelector('.paper-list');
        let html = showAssignButton();

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

function getPaperItemClass(paperPath) {
    const userInfo = JSON.parse(atob(localStorage.getItem('token')));
    const task = paperTasks[paperPath];

    if (!task) {
        return userInfo.role === 'admin' ? '' : 'hidden';
    }

    if (task.status === 'completed') {
        return 'completed';
    }

    if (task.assignTo === userInfo.username) {
        return 'assigned current-user';
    }

    return 'assigned';
}

function canAccessPaper(paperPath) {
    const userInfo = JSON.parse(atob(localStorage.getItem('token')));
    if (userInfo.role === 'admin') return true;

    const task = paperTasks[paperPath];
    return task && task.assignTo === userInfo.username;
}

async function loadFolder(element, path) {
    const contentDiv = element.nextElementSibling;

    if (contentDiv.children.length > 0) {
        contentDiv.classList.toggle('hidden');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/papers?path=${encodeURIComponent(path)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        let html = '';
        if (data.files) {
            for (const item of data.files) {
                if (item.type === 'F') {
                    html += `<div class="class-group">
                        <h4 class="folder" onclick="loadFolder(this, '${path}/${item.name}')">${item.name}</h4>
                        <div class="folder-content hidden"></div>
                    </div>`;
                } else {
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