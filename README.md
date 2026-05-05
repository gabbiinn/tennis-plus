# 🎾 TENNIS+ — Code de démarrage

PWA (Progressive Web App) pour connecter les joueurs de tennis. Stack : React + Vite + Tailwind + Supabase.

---

## 📋 PRÉREQUIS

- **Node.js 18+** ([télécharger ici](https://nodejs.org))
- **Git** ([télécharger ici](https://git-scm.com))
- Un compte **GitHub** (gratuit)
- Un compte **Supabase** (gratuit)
- Un compte **Vercel** ou **Netlify** (gratuit) pour le déploiement

---

## 🚀 INSTALLATION (5 minutes)

### 1. Récupérer le code

```bash
# Décompresser le dossier tennis-plus-starter, puis :
cd tennis-plus-starter
npm install
```

### 2. Configurer Supabase

1. Aller sur [supabase.com](https://supabase.com) et créer un projet (gratuit)
2. Dans **SQL Editor**, exécuter le fichier `supabase/schema.sql` fourni
3. Récupérer l'URL et la clé anon dans **Settings > API**
4. Créer un fichier `.env` à la racine :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxx
```

### 3. Lancer le projet en local

```bash
npm run dev
```

L'app est dispo sur `http://localhost:5173` 🎉

### 4. Builder pour la prod

```bash
npm run build
```

---

## 🌐 DÉPLOIEMENT (10 minutes)

### Avec Vercel (recommandé, plus simple)

1. Pousser le code sur GitHub
2. Aller sur [vercel.com](https://vercel.com) > **New Project**
3. Importer le repo GitHub
4. Ajouter les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
5. Cliquer **Deploy** → ton app est en ligne en 30 secondes

URL générée : `tennis-plus.vercel.app` (gratuit, ou domaine custom)

---

## 📁 STRUCTURE DU PROJET

```
tennis-plus-starter/
├── public/
│   ├── manifest.json          # Config PWA (installation sur téléphone)
│   └── icons/                 # Icônes app (à générer depuis le monogramme)
├── src/
│   ├── components/
│   │   ├── Logo.jsx           # Wordmark + monogramme TENNIS+
│   │   ├── BottomNav.jsx      # Navigation 5 onglets
│   │   └── ...
│   ├── screens/
│   │   ├── Home.jsx           # Écran d'accueil
│   │   ├── Partners.jsx       # Recherche partenaires
│   │   ├── Courts.jsx         # Réservation courts
│   │   ├── Tournaments.jsx    # Tournois
│   │   └── Talk.jsx           # Messages + conseils
│   ├── lib/
│   │   └── supabase.js        # Client Supabase
│   ├── hooks/
│   │   └── useAuth.js         # Hook d'authentification
│   ├── App.jsx                # Routing principal
│   ├── main.jsx               # Point d'entrée
│   └── index.css              # Tailwind + fonts
├── supabase/
│   └── schema.sql             # Schéma de base de données complet
├── .env.example
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🎨 IDENTITÉ VISUELLE

- **Couleurs** :
  - Bleu hard court : `#1E5FAF` (défaut)
  - Orange terre battue : `#C75D3F` (avril-juin)
  - Vert gazon : `#2D5016` (juillet-août)
  - Crème : `#F4F4F2`
  - Noir : `#0A0A0A`

- **Typographie** :
  - Display : **Archivo Black** (titres uppercase)
  - Body : **Manrope** (texte courant)

- **Logo** : voir composant `<Logo />` dans `src/components/Logo.jsx`

Le monogramme change automatiquement selon la saison (logique dans `Logo.jsx`).

---

## 🔐 AUTHENTIFICATION

Supabase gère tout : signup, login, reset password, sessions. Voir le hook `useAuth.js`.

Pour la V0 : email + mot de passe uniquement.

---

## 🗺 GÉOLOCALISATION

```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords;
    // Sauver dans Supabase
  },
  (err) => console.error(err)
);
```

Calcul de distance entre 2 points (formule de Haversine) : voir `src/utils/distance.js`.

---

## 📲 INSTALLATION PWA SUR LES TÉLÉPHONES

Une fois l'app déployée, les utilisateurs peuvent l'installer :

**iPhone (Safari)** :
1. Ouvrir le site dans Safari
2. Bouton "Partager" > "Sur l'écran d'accueil"
3. L'icône TENNIS+ apparaît

**Android (Chrome)** :
1. Ouvrir le site dans Chrome
2. Menu (3 points) > "Installer l'application"
3. L'icône TENNIS+ apparaît

C'est tout — pas d'App Store, pas de Google Play, pas de frais. 🎉

---

## ✅ TODO LIST POUR LE DEV (V0)

- [ ] Installer le projet et faire tourner en local
- [ ] Créer le projet Supabase et exécuter le schéma SQL
- [ ] Configurer les variables d'environnement
- [ ] Tester l'inscription / connexion
- [ ] Brancher le vrai utilisateur dans `Home.jsx`
- [ ] Implémenter la recherche de partenaires (filtrage par niveau + distance)
- [ ] Implémenter la messagerie 1-1
- [ ] Déployer sur Vercel
- [ ] Acheter le domaine `tennisplus.fr` et le brancher

---

## 🆘 BESOIN D'AIDE ?

- Doc React : https://react.dev
- Doc Supabase : https://supabase.com/docs
- Doc Tailwind : https://tailwindcss.com/docs
- Doc Vite PWA : https://vite-pwa-org.netlify.app

---

*Tennis+ — Tout le tennis, en plus.*
