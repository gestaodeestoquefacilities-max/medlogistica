<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ormeTKROo2eRit3MUWSYz8MeFesd5uof

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy no Vercel

1. Envie o projeto para um repositório no **GitHub** (crie o repositório e faça push do código).
2. Acesse [vercel.com](https://vercel.com), faça login e clique em **Add New** → **Project**.
3. Importe o repositório do GitHub (autorize o Vercel se for a primeira vez).
4. O Vercel detecta o Vite automaticamente. Confirme:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Se o app usar **GEMINI_API_KEY**, em **Environment Variables** adicione `GEMINI_API_KEY` com o valor desejado (opcional para o build).
6. Clique em **Deploy**. O site ficará disponível em um link do tipo `seu-projeto.vercel.app`.
