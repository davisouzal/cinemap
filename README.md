# Cinemap

O cinemao é um projeto que consiste em um gerenciador de filmes, onde iremos fornecer para o usuário uma forma dele organizar seus filmes. O sistema pode oferecer uma lista de filmes e um sistema de pesquisa para o usuário definir se ele pretende assistir, se ele assistiu o filme ou se ele desistiu de assistir o filme.
Esse sistema também recomenda os filmes baseados na pesquisa que o usuário fez e nos históricos de filmes do usuário.


## Requisitos
- Python 3.8 ou superior
- Flask
- SQLAlchemy
- Flask-Migrate
- Flask-CORS
- Requests
- Dotenv
- Docker

## Instruções para Instalação
1. Clone o repositório
```
git clone https://github.com/seu-usuario/cinemap-backend.git
cd cinemap-backend/movieService
```
2. Crie um ambiente virtual (recomendado)

No Windows:
```
python -m venv venv
venv\Scripts\activate
```
No Linux:
```
python3 -m venv venv
source venv/bin/activate
```
3. Instale as dependências
Com o ambiente virtual ativado, execute:
```
pip install -r requirements.txt
```
4. Configure as variáveis de ambiente
Crie um arquivo .env no diretório movieService e adicione a chave de API do The Movie Database (TMDb):
```
TOKEN_TMDB_API=SEU_TOKEN_AQUI
```

*Substitua SEU_TOKEN_AQUI pelo token de autenticação da API TMDb.*

5. Execute as migrações do banco de dados
Inicialize e aplique as migrações para criar o banco de dados:

```
flask db init
flask db migrate
flask db upgrade
```
<b>Faça o mesmo para consegujr rodar o serviço de autenticação, apenas retirando a parte do arquivo de configuração de ambiente (.env).</b>

## Executando a Aplicação
Para iniciar o servidor Flask, execute:
 ```sh
flask run -p {porta}
 ```
Isso iniciará o servidor na porta descrita. Acesse a aplicação em ```http://127.0.0.1:{porta}```. Faça esse processo tanto para o serviço de autenticação quanto para o de filmes.

Já para rodar o serviço de recomendação basta rodar o docker com o comando:
```sh
docker compose up # adicione a tag -d em caso de querer rodar em segundo plano
```

## Rotas da API
### 1. Listar Endpoints de recomendação
- Rota: /
- Método: GET
- Descrição: Retorna uma lista de todos os endpoints disponíveis na API, junto com os métodos e suas descrições.
- Exemplo de Resposta:
```
{
  "endpoints": [
    {
      "endpoint": "/",
      "method": "GET",
      "description": "get api endpoints, methods and their descriptions"
    },
    {
      "endpoint": "/recommend",
      "method": "POST",
      "description": "send movie data to get recommendations of other movies (receive a list of ids from TMDB)"
    },
    {
      "endpoint": "/explore",
      "method": "POST",
      "description": "send movies with scores to get recommendations of other movies (receive a list of ids from TMDB)"
    }
  ]
}
```

### 2. Buscar filme por ID
- Rota: /movies/searchById/<int:id>
- Método: GET
- Descrição: Retorna informações detalhadas de um filme utilizando a API do TMDb.
- Exemplo de Resposta:
```
{
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac...",
  "poster_path": "/poster.jpg",
  "genres": ["Drama"],
  "year": "1999",
  "runtime": "2h 19m",
  "production": "20th Century Fox",
  "fullStars": [0, 0, 0],
  "emptyStars": [0, 0],
  "hasHalfStar": false,
  "vote_average": 8.4
}
```

### 3. Buscar filmes de um usuário
- Rota: /users/movies
- Método: GET
- Query Params:
    - userId (obrigatório): ID do usuário.
    - status (opcional): Status do filme (ex.: "assistido").
- Descrição: Retorna a lista de filmes salvos pelo usuário.
- Exemplo de Resposta:
```
[
  {
    "id": 1,
    "tmdb_id": "550",
    "status": "watched",
    "rating": "5",
    "watchedLocation": "Home"
  }
]
```

### 4. Adicionar filme ao usuário
- Rota: /users/movies/<string:tmdbId>
- Método: POST
- Query Params:
    - userId (obrigatório): ID do usuário.
- Descrição: Adiciona um filme à lista de um usuário.
- Body:
```
{
  "status": "watched"
}
```
- Exemplo de Resposta:
```
{
  "message": "Movie added"
}
```

### 5. Deletar filme de um usuário
- Rota: /users/movies/<int:movieId>
- Método: DELETE
- Query Params:
    - userId (obrigatório): ID do usuário.
- Descrição: Remove um filme da lista de um usuário.
- Exemplo de Resposta:
```
{
  "message": "Movie deleted"
}
```

### 6. Atualizar status ou nota de um filme
- Rota: /users/movies/<int:movieId>
- Método: PUT
- Query Params:
    - userId (obrigatório): ID do usuário.
- Descrição: Atualiza o status ou a nota de um filme salvo.
- Body:
```
{
  "status": "watched",
  "rating": "4.5"
}
```
- Exemplo de Resposta:
```
{
  "message": "Movie updated"
}
```

### 7. Listar todos os usuários
- Rota: /users
- Método: GET
- Descrição: Retorna uma lista de todos os usuários cadastrados no sistema.
- Exemplo de resposta:
```
[
  {
    "id": 1,
    "email": "user1@example.com",
    "name": "User One"
  },
  {
    "id": 2,
    "email": "user2@example.com",
    "name": "User Two"
  }
]
```

### 8. Consultar usuário por ID
- Rota: /users/<int:userId>
- Método: GET
- Descrição: Retorna os detalhes de um usuário específico com base no userId fornecido.
- Exemplo de Resposta:
```
{
  "id": 1,
  "email": "user1@example.com",
  "name": "User One"
}
```

### 9. Criar um novo usuário
- Rota: /users
- Método: POST
- Descrição: Cria um novo usuário com as informações fornecidas.
```
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123"
}
```
- Exemplo de Resposta:
```
{
  "error": false
}
```

### 10. Autenticar usuário
- Rota: /login
- Método: POST
- Descrição: Realiza a autenticação de um usuário com base no email e senha fornecidos.
- Body:
```
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Exemplo de Resposta:
```
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name"
}
```
- Erros Possíveis:
  - **400 Bad Request**: Email e senha são obrigatórios.
  - **404 Not Found**: Usuário não encontrado.
  - **401 Unauthorized**: Senha incorreta.
  - **500 Internal Server Error**: Erro ao logar.

### 11. Recomendar Filmes a Partir de um Filme
- Rota: /recommend
- Método: POST
- Descrição: Envia dados de um filme para obter recomendações de outros filmes, retornando uma lista de IDs do TMDb.
- Body:
```
{
  "id": 550,
  "title": "Fight Club",
  "genres": ["Drama"],
  "year": 1999,
  "rating": 4.5,
  "state": "watched"
}
```
- Exemplo de Resposta:
```
[
  1234,
  5678,
  91011
]
```

### 12. Explorar Filmes
- Rota: /explore
- Método: POST
- Descrição: Envia uma lista de filmes com pontuações para obter recomendações de outros filmes, retornando uma lista de IDs do TMDb. A lógica considera o estado e a avaliação dos filmes enviados.
- Body:
```
{
  "movies": [
    {
      "id": 550,
      "title": "Fight Club",
      "genres": ["Drama"],
      "year": 1999,
      "rating": 4.5,
      "state": "watched"
    },
    {
      "id": 600,
      "title": "The Matrix",
      "genres": ["Action", "Sci-Fi"],
      "year": 1999,
      "rating": 4.8,
      "state": "liked"
    }
  ]
}
```

- Exemplo de Resposta:
```
[
  2222,
  3333,
  4444
]
```