// 配置常量
const API_KEYS = [
  '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',
  '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',
  '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',
  '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'
];
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// DOM 元素
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat-button');
const r1Btn = document.getElementById('r1-btn');
const searchBtn = document.getElementById('search-btn');
const chatContainer = document.querySelector('.chat-container');

// 初始化聊天歷史和狀態
let chatSessions = [];
let currentSession = -1;
let messages = [];
let isR1Enabled = false;
let isSearchEnabled = false;
let selectedModel = 'deepseek/deepseek-chat';

// 創建側邊欄
const sidebar = document.createElement('div');
sidebar.id = 'sidebar';
sidebar.style.position = 'fixed';
sidebar.style.left = '0';
sidebar.style.top = '0';
sidebar.style.width = '15vw';
sidebar.style.height = '100%';
sidebar.style.backgroundColor = '#D3D3D3';
sidebar.style.overflowY = 'auto';
sidebar.style.transition = 'width 0.3s ease';
sidebar.style.zIndex = '1000';
document.body.insertBefore(sidebar, document.body.firstChild);

const toggleButton = document.createElement('button');
toggleButton.textContent = '收起';
toggleButton.style.backgroundColor = '#007bff';
toggleButton.style.color = 'white';
toggleButton.style.border = 'none';
toggleButton.style.borderRadius = '5px';
toggleButton.style.padding = '5px 10px';
toggleButton.style.margin = '10px';
toggleButton.style.cursor = 'pointer';
toggleButton.style.display = 'block';
sidebar.appendChild(toggleButton);

const sidebarTitle = document.createElement('div');
sidebarTitle.textContent = '會話歷史';
sidebarTitle.style.padding = '10px';
sidebarTitle.style.fontWeight = 'bold';
sidebarTitle.style.position = 'sticky';
sidebarTitle.style.top = '50px';
sidebarTitle.style.backgroundColor = '#D3D3D3';
sidebarTitle.style.zIndex = '10';
sidebar.appendChild(sidebarTitle);

const sidebarContent = document.createElement('div');
sidebarContent.id = 'sidebar-content';
sidebarContent.style.paddingTop = '10px';
sidebar.appendChild(sidebarContent);

// 創建右側展開按鈕
const expandButton = document.createElement('button');
expandButton.textContent = '收起';
expandButton.style.position = 'fixed';
expandButton.style.right = '10px';
expandButton.style.top = '10px';
expandButton.style.backgroundColor = '#007bff';
expandButton.style.color = 'white';
expandButton.style.border = 'none';
expandButton.style.borderRadius = '5px';
expandButton.style.padding = '5px 10px';
expandButton.style.cursor = 'pointer';
expandButton.style.zIndex = '2000';
document.body.appendChild(expandButton);

// 側邊欄切換邏輯
let isSidebarCollapsed = false;
function toggleSidebar() {
  isSidebarCollapsed = !isSidebarCollapsed;
  if (isSidebarCollapsed) {
    sidebar.style.width = '0';
    sidebar.style.padding = '0';
    chatContainer.style.marginLeft = '0';
    chatContainer.style.width = '100vw';
    userInput.style.width = '70vw';
    toggleButton.textContent = '展開';
    sidebarTitle.style.display = 'none';
    sidebarContent.style.display = 'none';
    expandButton.textContent = '展開';
    centerButtons();
  } else {
    sidebar.style.width = '15vw';
    sidebar.style.padding = '0 10px';
    chatContainer.style.marginLeft = '15vw';
    chatContainer.style.width = '85vw';
    userInput.style.width = '10vw';
    toggleButton.textContent = '收起';
    sidebarTitle.style.display = 'block';
    sidebarContent.style.display = 'block';
    expandButton.textContent = '收起';
    centerButtons();
  }
}

// 將按鈕置中
function centerButtons() {
  const chatWidth = isSidebarCollapsed ? '95vw' : '100vw';
  const buttonContainerWidth = '50vw';
  const offset = `calc((${chatWidth} - ${buttonContainerWidth}) / 2)`;
  newChatButton.style.left = offset;
  r1Btn.parentElement.style.left = offset;
  r1Btn.parentElement.style.width = buttonContainerWidth;
}

// 綁定事件
toggleButton.addEventListener('click', toggleSidebar);
expandButton.addEventListener('click', toggleSidebar);

toggleButton.addEventListener('mouseover', () => {
  toggleButton.style.backgroundColor = '#0056b3';
});
toggleButton.addEventListener('mouseout', () => {
  toggleButton.style.backgroundColor = '#007bff';
});
expandButton.addEventListener('mouseover', () => {
  expandButton.style.backgroundColor = '#0056b3';
});
expandButton.addEventListener('mouseout', () => {
  expandButton.style.backgroundColor = '#007bff';
});

// 調整按鈕初始位置
newChatButton.style.bottom = '110px';
newChatButton.style.width = 'auto';
r1Btn.parentElement.style.position = 'fixed';
r1Btn.parentElement.style.bottom = '0';
centerButtons();

// 載入歷史記錄
function loadChatHistory() {
  const savedSessions = localStorage.getItem('chatSessions');
  if (savedSessions) {
    chatSessions = JSON.parse(savedSessions);
    if (chatSessions.length > 0) {
      currentSession = 0;
      messages = chatSessions[currentSession].messages;
      displayChatHistory();
      updateSidebarContent();
    } else {
      startNewChat();
    }
  } else {
    startNewChat();
  }
}

// 保存歷史記錄
function saveChatHistory() {
  localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
}

// ... (Keep all other parts of your code unchanged until `displayMessage`) ...

// 顯示消息到聊天歷史
function displayMessage(role, content, reasoningContent = '', isStreaming = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container';
  
  if (role === 'user') {
    messageDiv.classList.add('user-message-container');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    userMessageDiv.textContent = content;
    messageDiv.appendChild(userMessageDiv);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '5px';
    buttonContainer.style.marginTop = '5px';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '複製';
    copyBtn.style.backgroundColor = '#007bff';
    copyBtn.style.color = 'white';
    copyBtn.style.border = 'none';
    copyBtn.style.borderRadius = '3px';
    copyBtn.style.padding = '2px 5px';
    copyBtn.style.cursor = 'pointer';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(content);
      copyBtn.textContent = '已複製';
      setTimeout(() => copyBtn.textContent = '複製', 1000); // Reset after 1 second
    });
    buttonContainer.appendChild(copyBtn);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '編輯';
    editBtn.style.backgroundColor = '#28a745';
    editBtn.style.color = 'white';
    editBtn.style.border = 'none';
    editBtn.style.borderRadius = '3px';
    editBtn.style.padding = '2px 5px';
    editBtn.style.cursor = 'pointer';
    editBtn.addEventListener('click', () => {
      userInput.value = content; // Populate input with message content
      const messageIndex = messages.findIndex(msg => msg.role === 'user' && msg.content === content);
      if (messageIndex !== -1) {
        messages.splice(messageIndex, 1); // Remove the old message from history
        saveChatHistory();
        displayChatHistory(); // Refresh chat history
      }
    });
    buttonContainer.appendChild(editBtn);

    messageDiv.appendChild(buttonContainer);
  } else if (role === 'assistant') {
    messageDiv.classList.add('assistant-message-container');
    const aiHeader = document.createElement('div');
    aiHeader.className = 'ai-header';
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = 'https://qph.cf2.poecdn.net/main-thumb-pb-5492287-200-gpytlazikpfbrplrgvjrenuykrmxlsda.jpeg';
    const aiName = document.createElement('span');
    aiName.className = 'ai-name';
    aiName.textContent = 'DeepSeek';
    const aiStatus = document.createElement('span');
    aiStatus.className = 'ai-status';
    aiStatus.textContent = isR1Enabled ? '- R1' : '- V3';
    aiHeader.appendChild(avatar);
    aiHeader.appendChild(aiName);
    aiHeader.appendChild(aiStatus);
    messageDiv.appendChild(aiHeader);

    const reasoningDiv = document.createElement('div');
    reasoningDiv.className = 'reasoning-chain';
    if (isR1Enabled) {
      reasoningDiv.innerHTML = `
        <div class="reasoning-title">深度思考</div>
        <details>
          <summary class="reasoning-toggle"></summary>
          <div class="reasoning-content">${reasoningContent ? DOMPurify.sanitize(marked.parse(reasoningContent)) : '處理中...'}</div>
        </details>`;
      reasoningDiv.style.display = 'block';
    } else {
      reasoningDiv.style.display = 'none';
    }
    messageDiv.appendChild(reasoningDiv);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'assistant-message';
    if (isStreaming) {
      contentDiv.dataset.streaming = 'true';
    } else {
      contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
    }
    messageDiv.appendChild(contentDiv);
  }
  
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return role === 'assistant' ? {
    reasoningElement: messageDiv.querySelector('.reasoning-content'),
    messageElement: messageDiv.querySelector('.assistant-message')
  } : null;
}

// ... (Keep all other parts of your code unchanged after `displayMessage`) ...

// 顯示和移除“思考中”指示器
function showThinkingIndicator() {
  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'thinking-indicator';
  thinkingDiv.id = 'thinking';
  thinkingDiv.textContent = 'AI 思考中...';
  chatHistory.appendChild(thinkingDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function removeThinkingIndicator() {
  const thinkingDiv = document.getElementById('thinking');
  if (thinkingDiv) thinkingDiv.remove();
}

// 調用 OpenRouter API
async function callStreamingAPI(model, messages, elements, useWebPlugin = false, apiKeyIndex = 0) {
  const requestBody = {
    model: model,
    messages: messages,
    stream: true,
    reasoning: isR1Enabled ? { effort: 'high' } : undefined
  };

  if (useWebPlugin) {
    requestBody.plugins = [{
      id: 'web',
      max_results: 3,
      search_prompt: '以下是有關此問題的網絡搜索結果：'
    }];
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEYS[apiKeyIndex]}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok && apiKeyIndex < API_KEYS.length - 1) {
    console.warn(`API Key ${apiKeyIndex} 失敗，嘗試下一個密鑰...`);
    return callStreamingAPI(model, messages, elements, useWebPlugin, apiKeyIndex + 1);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let reasoningContent = '';
  let answerContent = '';
  let inReasoning = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    while (buffer.includes('\n')) {
      const lineEnd = buffer.indexOf('\n');
      const line = buffer.slice(0, lineEnd).trim();
      buffer = buffer.slice(lineEnd + 1);

      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;

        try {
          const dataObj = JSON.parse(data);
          const delta = dataObj.choices[0].delta;

          if ('reasoning' in delta && delta.reasoning) {
            reasoningContent += delta.reasoning;
          } else if ('content' in delta && delta.content) {
            if (delta.content.includes('<thinking>')) {
              inReasoning = true;
              reasoningContent += delta.content.replace('<thinking>', '');
            } else if (delta.content.includes('</thinking>')) {
              inReasoning = false;
              reasoningContent += delta.content.replace('</thinking>', '');
            } else if (inReasoning) {
              reasoningContent += delta.content;
            } else {
              answerContent += delta.content;
            }
          }

          if (isR1Enabled && elements.reasoningElement && reasoningContent) {
            elements.reasoningElement.innerHTML = DOMPurify.sanitize(marked.parse(reasoningContent));
            elements.reasoningElement.parentElement.parentElement.style.display = 'block';
          }
          if (elements.messageElement && answerContent) {
            elements.messageElement.innerHTML = DOMPurify.sanitize(marked.parse(answerContent));
          }
          chatHistory.scrollTop = chatHistory.scrollHeight;
        } catch (e) {
          console.error('數據流 JSON 解析錯誤:', e);
        }
      }
    }
  }

  const finalContent = answerContent || reasoningContent;
  if (!finalContent && apiKeyIndex < API_KEYS.length - 1) {
    console.warn(`API Key ${apiKeyIndex} 返回空回應，嘗試下一個密鑰...`);
    return callStreamingAPI(model, messages, elements, useWebPlugin, apiKeyIndex + 1);
  }

  return finalContent;
}

// 處理消息發送邏輯
async function callDeepSeekAPI(inputText) {
  messages.push({ role: 'user', content: inputText });
  displayMessage('user', inputText);
  showThinkingIndicator();

  try {
    let model = selectedModel;
    if (isR1Enabled) {
      model = 'deepseek/deepseek-r1:free';
    }
    const prompt = isR1Enabled
      ? `${inputText} 請在 <thinking> 和 </thinking> 標籤內提供詳細的思考過程，然後在標籤外提供最終答案。`
      : inputText;

    removeThinkingIndicator();
    const elements = displayMessage('assistant', '', '', true);
    const response = await callStreamingAPI(model, [
      ...messages,
      { role: 'user', content: prompt }
    ], elements);

    if (response) {
      messages.push({ role: 'assistant', content: response });
      saveChatHistory();
      updateSidebarContent();
    } else {
      elements.messageElement.innerHTML = '所有 API 均未返回有效回覆，請稍後再試。';
    }
  } catch (error) {
    removeThinkingIndicator();
    displayMessage('assistant', `API 調用失敗: ${error.message}`);
    console.error('API 錯誤:', error);
  }
}

// 執行聯網搜索
async function handleSearch(inputText) {
  messages.push({ role: 'user', content: `聯網搜索: ${inputText}` });
  displayMessage('user', `聯網搜索: ${inputText}`);
  showThinkingIndicator();

  try {
    const model = selectedModel;
    removeThinkingIndicator();
    const elements = displayMessage('assistant', '', '', true);
    const response = await callStreamingAPI(model, [
      ...messages,
      { role: 'user', content: inputText }
    ], elements, true);

    if (response) {
      messages.push({ role: 'assistant', content: response });
      saveChatHistory();
      updateSidebarContent();
    } else {
      elements.messageElement.innerHTML = '所有 API 均未返回有效搜索結果，請稍後再試。';
    }
  } catch (error) {
    removeThinkingIndicator();
    displayMessage('assistant', `搜索失敗: ${error.message}`);
    console.error('搜索錯誤:', error);
  }
}

// 發送消息
function sendMessage() {
  const inputText = userInput.value.trim();
  if (inputText) {
    if (isSearchEnabled) {
      handleSearch(inputText);
    } else {
      callDeepSeekAPI(inputText);
    }
    userInput.value = '';
  }
}

// 開啟新對話
function startNewChat() {
  const newSession = {
    messages: [
      { role: 'system', content: '您是由 DeepSeek 提供技術支援的助手。' }
    ]
    // 不再需要 timestamp，因為不會顯示時間
  };
  chatSessions.push(newSession);
  currentSession = chatSessions.length - 1;
  messages = newSession.messages;
  chatHistory.innerHTML = '';
  isR1Enabled = false;
  isSearchEnabled = false;
  r1Btn.classList.remove('active');
  searchBtn.classList.remove('active');
  saveChatHistory();
  updateSidebarContent();
}

// 刪除會話
function deleteSession(index) {
  if (confirm('確定要刪除此會話嗎？')) {
    chatSessions.splice(index, 1);
    saveChatHistory();
    if (chatSessions.length === 0) {
      startNewChat(); // 如果刪除後沒有會話，創建新的
    } else {
      currentSession = Math.min(index, chatSessions.length - 1); // 調整當前會話
      messages = chatSessions[currentSession].messages;
      displayChatHistory();
    }
    updateSidebarContent();
  }
}

// 更新側邊欄內容（移除時間顯示，添加刪除按鈕）
function updateSidebarContent() {
  sidebarContent.innerHTML = '';
  if (!isSidebarCollapsed) {
    chatSessions.forEach((session, index) => {
      const userMessages = session.messages.filter(m => m.role === 'user');
      if (userMessages.length > 0) {
        const title = userMessages[0].content.slice(0, 20) + (userMessages[0].content.length > 20 ? '...' : '');
        const sessionDiv = document.createElement('div');
        sessionDiv.style.display = 'flex';
        sessionDiv.style.alignItems = 'center';
        sessionDiv.style.padding = '10px';
        sessionDiv.style.cursor = 'pointer';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title; // Removed the index + 1 numbering
        titleSpan.style.flexGrow = '1';
        titleSpan.addEventListener('click', () => {
          currentSession = index;
          messages = chatSessions[index].messages;
          displayChatHistory();
          updateSidebarContent();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '刪除';
        deleteBtn.style.backgroundColor = '#ff4444';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '3px';
        deleteBtn.style.padding = '2px 5px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.addEventListener('click', () => deleteSession(index));
        deleteBtn.addEventListener('mouseover', () => {
          deleteBtn.style.backgroundColor = '#cc0000';
        });
        deleteBtn.addEventListener('mouseout', () => {
          deleteBtn.style.backgroundColor = '#ff4444';
        });

        sessionDiv.appendChild(titleSpan);
        sessionDiv.appendChild(deleteBtn);
        if (index === currentSession) {
          sessionDiv.style.backgroundColor = '#B0B0B0';
        }
        sidebarContent.appendChild(sessionDiv);
      }
    });
  }
}

// 顯示當前會話歷史
function displayChatHistory() {
  chatHistory.innerHTML = '';
  messages.forEach(msg => {
    displayMessage(msg.role, msg.content);
  });
}

// 處理“深度思考 (R1)”按鈕
function toggleR1() {
  isR1Enabled = !isR1Enabled;
  r1Btn.classList.toggle('active');
  if (isR1Enabled && isSearchEnabled) {
    isSearchEnabled = false;
    searchBtn.classList.remove('active');
  }
}

// 處理“聯網搜索”按鈕
function toggleSearch() {
  isSearchEnabled = !isSearchEnabled;
  searchBtn.classList.toggle('active');
  if (isSearchEnabled && isR1Enabled) {
    isR1Enabled = false;
    r1Btn.classList.remove('active');
  }
}

// 事件監聽
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
newChatButton.addEventListener('click', startNewChat);
r1Btn.addEventListener('click', toggleR1);
searchBtn.addEventListener('click', toggleSearch);

// 初始化
loadChatHistory();
chatContainer.style.marginLeft = '15vw';
chatContainer.style.width = '85vw';
userInput.style.width = '49vw';

// 添加歷史記錄導出功能
const exportButton = document.createElement('button');
exportButton.textContent = '導出歷史';
exportButton.style.position = 'fixed';
exportButton.style.right = '10px';
exportButton.style.top = '50px';
exportButton.style.backgroundColor = '#007bff';
exportButton.style.color = 'white';
exportButton.style.border = 'none';
exportButton.style.borderRadius = '5px';
exportButton.style.padding = '5px 10px';
exportButton.style.cursor = 'pointer';
document.body.appendChild(exportButton);

exportButton.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatSessions, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "chat_history.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});