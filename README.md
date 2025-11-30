# certnet – Docker tabanlı Blockchain Sertifika Sistemi

Bu proje, **Docker + Ganache + Hardhat + Node.js (CLI)** kullanarak,
kurum içi “dijital sertifika” 
oluşturma – doğrulama – iptal akışını gösteren örnek bir sistemdir.




Amaç:  
- Yerel bir EVM zinciri (Ganache) üzerinde
- `CertificateRegistry` akıllı kontratı ile
- KVKK’ya uygun (hash + salt temelli) sertifika kaydı tutmak
- Basit bir CLI ile sertifika üretme / doğrulama / iptal işlemlerini uçtan uca göstermek.

---

## 1. Mimari Genel Bakış

Proje 3 ana bileşenden oluşur:

- **chain (ganache)**  
  Docker içinde çalışan yerel EVM zinciri.  
  Varsayılan RPC: `http://localhost:8545`

- **hardhat (dapp/** klasörü)**  
  Akıllı kontratın (`CertificateRegistry.sol`) derlenmesi ve deploy işlemleri burada yapılır.

- **client (client/** klasörü)**  
  Node.js tabanlı bir CLI uygulaması (`action.js`).  
  Kullanıcı bu CLI ile:
  - sertifika ID üretebilir,
  - holderHash üretebilir,
  - sertifika basabilir (issue),
  - sertifikayı doğrulamaya çalışabilir (verify),
  - sertifikayı iptal edebilir (revoke).

---

## 2. Klasör Yapısı

```text
certnet/
  ├─ dapp/                 # Hardhat projesi
  │   ├─ contracts/
  │   │   └─ CertificateRegistry.sol
  │   ├─ scripts/
  │   │   └─ deploy.js
  │   ├─ hardhat.config.ts
  │   └─ package.json
  │
  ├─ client/               # Node.js CLI istemcisi
  │   ├─ action.js
  │   ├─ package.json
  │   └─ .env              # RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY
  │
  ├─ docker-compose.yml    # ganache + hardhat + client servisleri (certnet ağı)
  └─ README.md             # bu dosya



