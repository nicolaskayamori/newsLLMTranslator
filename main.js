const statusMessage = document.getElementById('statusMessage');
        const fetchButton = document.getElementById('fetchButton');
        const summariesContainer = document.getElementById('summariesContainer');

        fetchButton.addEventListener('click', async () => {
            updateStatus('Buscando notícias...', 'bg-blue-100 text-blue-700');
            fetchButton.disabled = true;

            try {
                // Requisição para a rota do servidor Node.js
                const newsResponse = await fetch('http://localhost:3000/api/noticias');
                if (!newsResponse.ok) {
                    const errorData = await newsResponse.json();
                    throw new Error(errorData.error);
                }
                const articles = await newsResponse.json();

                // Adicionando console.log para inspecionar os dados
                console.log('Artigos recebidos:', articles);

                if (articles.length === 0) {
                    updateStatus('Nenhuma notícia encontrada.', 'bg-yellow-100 text-yellow-700');
                    return;
                }

                summariesContainer.innerHTML = '';
                updateStatus('Gerando resumos com Ollama...', 'bg-indigo-100 text-indigo-700');

                for (let i = 0; i < Math.min(articles.length, 5); i++) {
                    const article = articles[i];
                    // Corrigido para acessar o conteúdo e o título da forma correta.
                    const title = article[0];
                    const textToSummarize = article[1];
                    if (textToSummarize) {
                         const summary = await getSummaryFromLLM(textToSummarize);
                         displaySummary(title, summary);
                    }
                }

                updateStatus('Resumos gerados com sucesso!', 'bg-green-100 text-green-700');

            } catch (error) {
                console.error('Erro:', error);
                updateStatus(`Ocorreu um erro: ${error.message}.`, 'bg-red-100 text-red-700');
            } finally {
                fetchButton.disabled = false;
            }
        });

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

        async function getSummaryFromLLM(text) {
            const prompt = `how many words is there in the following text:\n\n${text}`;
            const payload = {
                model: "llama3", // Troque para o nome do modelo que você instalou
                messages: [{
                    role: "user",
                    content: prompt
                }],
                stream: false
            };

            try {
                // Nova requisição para o servidor Node.js, que agora atua como proxy para o Ollama
                const response = await fetch('http://localhost:3000/api/ollama', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Erro na API do Ollama: ${response.statusText}`);
                }

                const result = await response.json();
                const summary = result?.message?.content;
                return summary || "Não foi possível gerar um resumo para esta notícia.";

            } catch (error) {
                console.error('Erro na chamada da API do Ollama:', error);
                return "Erro ao comunicar com o LLM. Verifique se o Ollama está rodando e se o servidor Node.js está ativo.";
            }
        }