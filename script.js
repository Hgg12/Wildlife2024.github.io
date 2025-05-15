document.addEventListener('DOMContentLoaded', function() {
    const previewTable = document.getElementById('preview-table');
    const loadingMessage = document.getElementById('loading-message');
    const dataPath = 'data/your_dataset.csv'; // 确保路径正确

    if (!previewTable || !loadingMessage) {
        console.error("无法找到表格或加载消息元素。");
        if(loadingMessage) loadingMessage.textContent = "错误：页面元素未找到。";
        return;
    }

    // 异步获取 CSV 文件
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 错误! 状态: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            loadingMessage.style.display = 'none'; // 隐藏加载消息
            const { headers, rows } = parseCSV(csvText);

            if (!headers || !rows) {
                previewTable.innerHTML = '<tr><td>无法解析CSV数据。</td></tr>';
                return;
            }

            // 创建表头
            const thead = previewTable.querySelector('thead');
            if (thead) {
                const headerRow = document.createElement('tr');
                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
            }


            // 创建数据行 (预览前5行)
            const tbody = previewTable.querySelector('tbody');
            if (tbody) {
                const numberOfRowsToPreview = Math.min(5, rows.length); // 最多预览5行
                for (let i = 0; i < numberOfRowsToPreview; i++) {
                    const row = rows[i];
                    const tr = document.createElement('tr');
                    row.forEach(cellData => {
                        const td = document.createElement('td');
                        td.textContent = cellData;
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                }
            }

        })
        .catch(error => {
            console.error('加载或解析CSV数据时出错:', error);
            loadingMessage.textContent = `错误加载数据: ${error.message}`;
            loadingMessage.style.color = 'red';
        });
});

/**
 * 简单的 CSV 解析函数
 * @param {string} csvText - CSV 格式的文本字符串
 * @returns {{headers: string[], rows: string[][]}} 解析后的数据
 */
function parseCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') {
        return { headers: null, rows: null };
    }
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
        return { headers: null, rows: null };
    }

    // 假设第一行是表头，并处理可能的CR字符
    const headers = lines[0].trim().split(',').map(header => header.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) { // 跳过空行
            // 简单的CSV行解析，不处理引号内的逗号等复杂情况
            const values = line.split(',').map(value => value.trim());
            rows.push(values);
        }
    }
    return { headers, rows };
}
