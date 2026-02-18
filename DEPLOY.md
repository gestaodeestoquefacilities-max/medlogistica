# Guia de Deploy - Resolvendo Erro 403

## Erro 403: Problema de Autenticação

O GitHub não aceita mais senhas via HTTPS. Você precisa usar um **Personal Access Token** ou **SSH**.

---

## Solução 1: Personal Access Token (Recomendado)

### Passo 1: Criar Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Dê um nome: `MedLogística Deploy`
4. Selecione a expiração (90 dias ou mais)
5. Marque a opção **`repo`** (todas as permissões de repositório)
6. Clique em **"Generate token"**
7. **COPIE O TOKEN** (aparece apenas uma vez! Exemplo: `ghp_xxxxxxxxxxxx`)

### Passo 2: Fazer Push

```powershell
# Navegar até a pasta do projeto
cd "c:\Users\junio\Downloads\copy-of-medlogística (1)"

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Initial commit - MedLogística"

# Fazer push
git push -u origin main
```

**Quando pedir credenciais:**
- **Username:** seu usuário do GitHub
- **Password:** cole o TOKEN (não use sua senha!)

---

## Solução 2: Usar SSH (Mais Seguro)

Se você já tem chave SSH configurada no GitHub:

```powershell
# Trocar remote para SSH
git remote set-url origin git@github.com:gestaodeestoquefacilities-max/medlogistica.git

# Fazer push
git push -u origin main
```

---

## Solução 3: GitHub Desktop ou GitHub CLI

- **GitHub Desktop:** Interface gráfica que gerencia autenticação automaticamente
- **GitHub CLI:** `gh auth login` e depois `gh repo create` + `git push`

---

## Depois do Push: Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. Importe o repositório `gestaodeestoquefacilities-max/medlogistica`
4. O Vercel detecta o Vite automaticamente
5. Clique em **Deploy**

Pronto! 🚀
