# certnet – Docker tabanlı Blockchain Sertifika Sistemi

Bu proje, **Docker + Ganache + Hardhat + Node.js (CLI)** kullanarak,
kurum içi “dijital sertifika” 
oluşturma – doğrulama – iptal akışını gösteren örnek bir sistemdir.


## YOUTUBE VİDEO LİNKİ  https://youtu.be/YDmqk_97BQ0  

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



##Çalıştırma Adımları
Docker Ganache
docker ps


Hardhat kontratını deploy
cd dapp
npx hardhat run scripts/deploy.js --network localhost



LI ile sertifika ID ve hash üretimi
cd client

node action.js hash 221229059 "Buse Erdogan" buse-salt-01



Sertifika oluşturulması
node action.js issue 0xfcbf013fa9700c08c4025fed5fd413e114c9adbb0e2e713ab75b755394bf1ed1 0x6d8f5c211cf3300a85e0f5f97e69da75aae198b501671cb37c576506fba2600f "Dijital Dönüşüme Giriş Sertifikası" "Bilgisayar Mühendisliği Bölümü" 0


verify
node action.js verify 0xfcbf013fa9700c08c4025fed5fd413e114c9adbb0e2e713ab75b755394bf1ed1 0x6d8f5c211cf3300a85e0f5f97e69da75aae198b501671cb37c576506fba2600f


revoke
node action.js revoke 0xfcbf013fa9700c08c4025fed5fd413e114c9adbb0e2e713ab75b755394bf1ed1


tekrarverify 
node action.js verify 0xfcbf013fa9700c08c4025fed5fd413e114c9adbb0e2e713ab75b755394bf1ed1 0x6d8f5c211cf3300a85e0f5f97e69da75aae198b501671cb37c576506fba2600f

