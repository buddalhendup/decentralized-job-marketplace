# Decentralized Job Marketplace

This repository contains an end‑to‑end example of a **decentralized job marketplace** built using a combination of on‑chain smart contracts and off‑chain web and mobile clients.  The goal of this project is to demonstrate how gig‑economy style work can be coordinated without a trusted intermediary — clients lock funds in a smart contract escrow, workers complete tasks, and payment is released automatically or by the client.  A small fee is collected by a community wallet, and participants build a transparent reputation over time.

## Features

### 🌐 On‑chain escrow

- **Smart contract escrow** on the Polygon Mumbai testnet (but deployable to any EVM network).  Clients lock payment in the contract when posting a job.  When the job is completed, funds are released to the worker minus a small fee.
- **Fee collection**: a configurable 1–3 % fee on each transaction is routed to a multi‑sig wallet controlled by the community.  The fee percentage and fee wallet can be updated by the contract owner (e.g. a DAO).
- **Deadline and auto release**: if the client does not confirm completion before the deadline, the worker can trigger an automatic release of funds after the deadline.

### 👥 Users and reputation

- Users can sign in with either an email/password (via Firebase) or a crypto wallet (MetaMask/WalletConnect).
- Each account has a profile page showing completed jobs, ratings and reviews.  Ratings are hashed and stored on chain for tamper resistance, and the actual review data is stored off‑chain (e.g. in Firebase or IPFS).

### 📦 Multi‑platform clients

- **Web client (React)**: browse and post jobs, connect your wallet, view your profile and reputation, accept work, and confirm completion.  Supports Metamask and WalletConnect.
- **Mobile client (React Native with Expo)**: similar functionality as the web client with an interface designed for phones.  Uses `@walletconnect/react-native-dapp` to connect to crypto wallets.

### 🔧 Smart contracts

The `smart-contract` folder contains a Solidity contract called `JobMarketplace.sol` together with Hardhat configuration and a deployment script.  The contract implements posting and accepting jobs, escrow and automatic release, and fee collection.  It does not require its own token — jobs can be priced in any ERC‑20 token (e.g. USDC or USDT).

## Getting started

This repository is split into three major parts:

| Path               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| `smart-contract/`  | Solidity contract and Hardhat configuration.                 |
| `web/`             | React web client with wallet integration and Firebase setup. |
| `mobile/`          | React Native mobile app built with Expo.                    |

### Prerequisites

* **Node.js** >= 18
* **npm** or **yarn**
* **Hardhat** (installed as a dev dependency) for compiling and deploying contracts
* A MetaMask/WalletConnect compatible wallet
* A Firebase project (for authentication and storing off‑chain data) if you intend to use email logins

### 1 ‑ Smart contract

1. Install dependencies and compile the contract:

   ```bash
   cd smart-contract
   npm install
   npx hardhat compile
   ```

2. Create a `.env` file in `smart-contract/` based on the provided `.env.example` and fill in:

   ```env
   POLYGON_MUMBAI_RPC_URL=<your RPC URL>
   PRIVATE_KEY=<your private key with MATIC for gas>
   FEE_WALLET=<multi‑sig fee wallet address>
   ```

3. Deploy to Polygon Mumbai:

   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```

   The script will output the deployed contract address.  Copy this address into both `.env` files for the web and mobile apps under `REACT_APP_CONTRACT_ADDRESS` and `EXPO_PUBLIC_CONTRACT_ADDRESS` respectively.

### 2 ‑ Web client

1. Install dependencies:

   ```bash
   cd web
   npm install
   ```

2. Copy `.env.example` to `.env` and set the following environment variables:

   ```env
   REACT_APP_CONTRACT_ADDRESS=<deployed contract address>
   REACT_APP_NETWORK=mumbai
   REACT_APP_FIREBASE_API_KEY=<your Firebase API key>
   REACT_APP_FIREBASE_AUTH_DOMAIN=<your Firebase auth domain>
   REACT_APP_FIREBASE_PROJECT_ID=<your Firebase project ID>
   REACT_APP_FIREBASE_STORAGE_BUCKET=<your Firebase storage bucket>
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your Firebase sender ID>
   REACT_APP_FIREBASE_APP_ID=<your Firebase app ID>
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. To build and deploy to GitHub Pages (optional), install the `gh-pages` package and run:

   ```bash
   npm install --save gh-pages
   npm run build
   npm run deploy
   ```

   This will build the static site and publish it to the `gh-pages` branch of your repository.  Make sure the repository exists and `homepage` is set in `web/package.json`.

### 3 ‑ Mobile client

1. Install Expo CLI if you do not have it:

   ```bash
   npm install -g expo-cli
   ```

2. Install dependencies and start the Expo server:

   ```bash
   cd mobile
   npm install
   expo start
   ```

3. Copy `app.example.json` to `app.json` and `.env.example` to `.env` and set the following variables:

   ```json
   {
     "expo": {
       "name": "JobMarketplace",
       "slug": "job-marketplace",
       "extra": {
         "eas": {
           "projectId": "<your EAS project ID>"
         },
         "contractAddress": "<deployed contract address>",
         "network": "mumbai",
         "firebaseConfig": {
           "apiKey": "<your Firebase API key>",
           "authDomain": "<your Firebase auth domain>",
           "projectId": "<your Firebase project ID>",
           "storageBucket": "<your Firebase storage bucket>",
           "messagingSenderId": "<your Firebase sender ID>",
           "appId": "<your Firebase app ID>"
         }
       }
     }
   }
   ```

4. Run on your device or emulator using the QR code provided by Expo.

### Limitations

- This repository does **not** automatically deploy to GitHub on its own.  Due to environment restrictions we cannot create GitHub repositories programmatically.  To publish this project you can manually create a repository on GitHub and push the contents of the `job-marketplace` folder using Git.
- The smart contract is provided for educational purposes.  Before using it in production, review and audit the code.  Gas costs, re‑entrancy and overflow checks, and advanced arbitration mechanisms are out of scope for this MVP.

## Screenshots

Below is a conceptual diagram of how funds flow through the marketplace contract:

```
Client posts job -----------+ 
                            |  lock payment in escrow  
Worker accepts job --------+---[ JobMarketplace.sol ]--- distributes funds
                            |                      \ 2% fee to feeWallet
Client confirms completion -+                       \ remaining to worker
```

Enjoy building on the decentralized gig economy!