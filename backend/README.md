## Como Rodar

1. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   SECRET_KEY=secreto
   JWT_SECRET_KEY=secreto
   DATABASE_URL=sqlite:///notifications.db
   ```

3. **Inicialize o banco de dados:**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. **Execute o servidor:**
   ```bash
   flask run
   ```

Servidor rodando em: `http://127.0.0.1:5000`

## Endpoints Disponíveis

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login (retorna token JWT)

### Notificações
*Todos os endpoints abaixo precisam do token JWT no header: `Authorization: Bearer <token>`*

- `GET /notifications/topics` - Listar tópicos
- `POST /notifications/topics` - Criar tópico
- `POST /notifications/topics/<id>/subscribe` - Inscrever-se em tópico
- `POST /notifications/topics/<id>/publish` - Publicar mensagem
- `GET /notifications/history` - Ver histórico de notificações