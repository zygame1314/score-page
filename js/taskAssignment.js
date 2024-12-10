function showAssignButton() {
    const userInfo = JSON.parse(atob(localStorage.getItem('token')));
    if (userInfo.role === 'admin') {
        return `<button onclick="showAssignDialog()" class="assign-btn">分配批阅任务</button>`;
    }
    return '';
}

async function showAssignDialog() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();

        const dialog = document.createElement('div');
        dialog.className = 'assign-dialog';
        dialog.innerHTML = `
            <h3>分配批阅任务</h3>
            <div class="assignment-mode">
                <label>
                    <input type="radio" name="assignMode" value="manual" checked> 手动选择
                </label>
                <label>
                    <input type="radio" name="assignMode" value="random"> 随机分配
                </label>
            </div>
            <div id="manualSelect">
                <select id="assignTo" multiple>
                    ${users.map(user => `
                        <option value="${user.username}">${user.name} (${user.username})</option>
                    `).join('')}
                </select>
                <small>按住Ctrl键可多选</small>
            </div>
            <div id="randomSelect" class="hidden">
                <label>分配人数：
                    <input type="number" id="assignCount" min="1" max="${users.length}" value="1">
                </label>
            </div>
            <button onclick="assignTask()">确认分配</button>
            <button onclick="closeAssignDialog()">取消</button>
        `;

        document.body.appendChild(dialog);

        const radios = dialog.querySelectorAll('input[name="assignMode"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.getElementById('manualSelect').classList.toggle('hidden', e.target.value === 'random');
                document.getElementById('randomSelect').classList.toggle('hidden', e.target.value === 'manual');
            });
        });
    } catch (error) {
        alert('获取用户列表失败');
    }
}

async function assignTask() {
    const mode = document.querySelector('input[name="assignMode"]:checked').value;
    let assignTo = [];

    if (mode === 'manual') {
        const select = document.getElementById('assignTo');
        assignTo = Array.from(select.selectedOptions).map(option => option.value);
    } else {
        const count = parseInt(document.getElementById('assignCount').value);
        const select = document.getElementById('assignTo');
        const allUsers = Array.from(select.options).map(option => option.value);
        assignTo = shuffleArray(allUsers).slice(0, count);
    }

    if (assignTo.length === 0) {
        alert('请选择至少一个批阅人');
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/api/assign-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                paperId: currentPaperId,
                assignTo
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert('任务分配成功');
            closeAssignDialog();
            loadPapers();
        } else {
            alert(data.message || '分配失败');
        }
    } catch (error) {
        alert('分配失败，请检查网络连接');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function closeAssignDialog() {
    const dialog = document.querySelector('.assign-dialog');
    if (dialog) {
        dialog.remove();
    }
}