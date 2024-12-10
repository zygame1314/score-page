let currentPaperId;

async function loadPaper(paperId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/papers?id=${paperId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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