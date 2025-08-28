    // script.js
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';

    const fetchButton = document.getElementById('fetchButton');
    const summariesContainer = document.getElementById('summariesContainer');
    const statusMessage = document.getElementById('statusMessage');

    fetchButton.addEventListener('click', async () => {
        // Inicia o processo de busca
        updateStatus('Buscando notícias...', 'bg-blue-100 text-blue-700');
        fetchButton.disabled = true;

        try {
            // Faz a requisição para a sua própria rota local
            const newsResponse = await fetch('http://localhost:3000/api/noticias');
            console.log(newsResponse);
          
            if (newsResponse.length === 0) {
                updateStatus('Nenhuma notícia encontrada.', 'bg-yellow-100 text-yellow-700');
                return;
            }

            // Limpa o conteúdo anterior
            summariesContainer.innerHTML = '';
            updateStatus('Gerando resumos...', 'bg-indigo-100 text-indigo-700');

            // Processa cada notícia e gera o resumo
            for (let i = 0; i < Math.min(newsResponse.length, 5); i++) { // Limita a 5 notícias para demonstração
                const article = newsResponse[i][0];
                const summary = await getGeminiSummary(article);
                displaySummary(article[0], summary);
            }

            updateStatus('Resumos gerados com sucesso!', 'bg-green-100 text-green-700');

        } catch (error) {
            console.error('Erro:', error);
            updateStatus(`Ocorreu um erro: ${error.message}.`, 'bg-red-100 text-red-700');
        } finally {
            fetchButton.disabled = false;
        }
    });

    // As funções `updateStatus`, `displaySummary` e `getGeminiSummary` permanecem as mesmas.
    function updateStatus(message, classes) {
        statusMessage.textContent = message;
        statusMessage.className = `block text-center text-sm font-medium p-3 rounded-lg ${classes}`;
    }

    function displaySummary(title, summary) {
        const summaryCard = document.createElement('article');
        summaryCard.className = 'bg-gray-50 p-6 rounded-xl shadow-md';
        summaryCard.innerHTML = `
            <h2 class="text-xl font-bold text-gray-800 mb-2">${title}</h2>
            <p class="text-gray-700 leading-relaxed">${summary}</p>
        `;
        summariesContainer.appendChild(summaryCard);
    }

    async function getGeminiSummary(text, retries = 3, delay = 1000) {
        // Código da função getGeminiSummary... (sem mudanças)
        const prompt = `Traduza para português o seguinte texto de notícia:\n\n${text}`;
        const payload = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        try {
            const apiKey = "";
            const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    console.warn(`Taxa de limite excedida. Tentando novamente em ${delay / 1000}s...`);
                    await new Promise(res => setTimeout(res, delay));
                    return getGeminiSummary(text, retries - 1, delay * 2);
                }
                throw new Error(`Erro na API do Gemini: ${response.statusText}`);
            }

            const result = await response.json();
            const summary = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            return summary || "Não foi possível gerar um resumo para esta notícia.";

        } catch (error) {
            console.error('Erro na chamada da API do Gemini:', error);
            return "Erro ao comunicar com o LLM. Tente novamente mais tarde.";
        }
    }
    