📦 Secure Pharmaceutical Supply Chain Blockchain Project Plan

✅ Phase 1: Core Infrastructure (Completed)

Authentication system for all participants (manufacturer, distributor, retailer, customer, admin)

Basic product management (add, update, delete, fetch)

Blockchain integration using Ganache + MetaMask for immutable record-keeping

✅ Supply Chain Flow

1️⃣ Manufacturing Stage

Manufacturer creates a product batch

Products are registered on the blockchain

Quality control checks are recorded

Products are packaged and prepared for shipping

2️⃣ Distribution Stage

Manufacturer transfers ownership to distributor on blockchain

Distributor confirms receipt, verifies product authenticity

Products stored in distribution centers, prepared for retailer shipments

3️⃣ Retail Stage

Distributor transfers ownership to retailer on blockchain

Retailer confirms receipt, verifies authenticity

Products added to store inventory, made available for sale

4️⃣ Customer Stage

Customer purchases product from retailer

Customer verifies product authenticity via blockchain (e.g., QR scan)

Customer can view complete product history (ownership trail)

🏗️ Data Model Requirements

✅ Product Model (extended)

Product ID, name, batch, expiry, etc.

Current owner address (Ethereum wallet)

Location history

Temperature/condition logs (optional)

Transfer history (ownership trail)

✅ Transfer Model (new)

Sender address (Ethereum wallet)

Receiver address (Ethereum wallet)

Timestamp

Digital signatures

Blockchain transaction hash

Transfer conditions (temperature, handling)

✅ Shipment Model (new)

Shipment ID

List of product IDs

Origin & destination

Carrier info

Expected vs. actual delivery dates

Shipping conditions

✅ Location Model (new)

Location ID

GPS coordinates

Facility type (manufacturer, distributor, retailer)

Address

Storage/handling conditions

👤 Key Actions by Role

🔹 Manufacturer

Create product batches with unique identifiers

Generate QR codes

Register products on blockchain

Create + transfer shipments to distributors

🔹 Distributor

Receive shipments

Verify blockchain records

Update location + condition info

Transfer shipments to retailers

🔹 Retailer

Receive + verify shipments

Update product status to in-store

Record customer sales

Transfer product ownership to customers

🔹 Customer

Verify product authenticity via QR

View product history (blockchain trace)

Report product issues

🔹 Admin

Monitor full supply chain operations

Generate analytics + reports

Manage user accounts + permissions

Resolve disputes

🔑 Blockchain Wallet Management

✅ Each participant (manufacturer, distributor, retailer, customer, admin) will have a blockchain wallet

Two possible approaches:

1️⃣ External Wallets (Recommended)

Users create their own wallets (MetaMask, TrustWallet)

Connect to the system via MetaMask browser extension or mobile app

All blockchain actions (product add, transfer, verification) are signed by the user via MetaMask

2️⃣ Backend-Managed Wallets (Optional for demo)

Backend generates Ethereum wallets for each user using ethers.js or web3.js

Private keys are securely stored (encrypted)

Backend signs transactions on behalf of the user

🛠 Tools and Stack

Backend: Node.js + Express.js (current)

Blockchain Network: Ganache (local), Ethereum (test/mainnet later)

Wallet Interface: MetaMask + Web3.js or ethers.js

Frontend: React.js with wallet connect integration

Smart Contracts: Solidity (for product + transfer management)