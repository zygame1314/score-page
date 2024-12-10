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
            <select id="assignTo">
                ${users.map(user => `
                    <option value="${user.username}">${user.name} (${user.username})</option>
                `).join('')}
            </select>
            <button onclick="assignTask()">确认分配</button>
            <button onclick="closeAssignDialog()">取消</button>
        `;

        document.body.appendChild(dialog);
    } catch (error) {
        alert('获取用户列表失败');
    }
}

async function assignTask() {
    const assignTo = document.getElementById('assignTo').value;
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
        } else {
            alert(data.message || '分配失败');
        }
    } catch (error) {
        alert('分配失败，请检查网络连接');
    }
}

function closeAssignDialog() {
    const dialog = document.querySelector('.assign-dialog');
    if (dialog) {
        dialog.remove();
    }
}