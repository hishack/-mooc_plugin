async function callZhipuAPI(messages, model = 'glm-4.6') {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.6
        })
    });

    if (!response.ok) {
        throw new Error(`API 调用失败: ${response.status}`);
    }

    return await response.json();
}

// 使用示例
const messages = [
    { role: 'user', content: '你好，请介绍一下自己' }
];

callZhipuAPI(messages)
    .then(result => {
        console.log(result.choices[0].message.content);
    })
    .catch(error => {
        console.error('错误:', error);
    });