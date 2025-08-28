    import express from 'express';
    import path from 'path';
    import fetch from 'node-fetch';
    import dotenv from 'dotenv'; // Carrega as variáveis do .env
    import { fileURLToPath } from 'url';
    import cors from 'cors';
    dotenv.config();
    const app = express();
    const PORT = 3000;
    app.use(cors());
    // Obtém a chave da API do arquivo .env
    const YOURKEY= process.env.YOURKEY;

    // Middleware para servir arquivos estáticos
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use(express.static(path.join(__dirname, 'public')));

    // Rota da API que irá buscar as notícias
    app.get('/api/noticias', async (req, res) => {
        try {
            // Verifica se a chave da API está configurada
            if (!YOURKEY) {
                return res.status(500).json({ error: 'Chave da API não configurada no .env' });
            }

            // Constrói a URL da API da GNews de forma segura
            const GNEWS_API_URL = `http://api.mediastack.com/v1/news?access_key=${YOURKEY}&limit=5`;
       
            // Faz a requisição HTTP para a API da GNews
            const newsResponse = await fetch(GNEWS_API_URL);
           
       
            // Verifica a resposta e trata possíveis erros
            if (!newsResponse.ok) {
                const errorData = await newsResponse.json();
                return res.status(newsResponse.status).json({ error: errorData.errors ? errorData.errors[0] : 'Erro desconhecido na API de notícias' });
            }
       
            // Retorna os dados da notícia para o cliente
            const newsData = await newsResponse.json();
            //console.log(newsData);
            const newsDataArray = [];
            newsData.data.forEach(element => {
                newsDataArray.push([element.title, element.description]);
            }); 
            console.log(newsDataArray);
            res.json(newsDataArray);
           
        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
            res.status(500).json({ error: 'Falha interna no servidor.' });
        }
    });

    // Inicia o servidor
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log('Abra o seu navegador e navegue para esta URL.');
    });