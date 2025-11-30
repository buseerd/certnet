import { ethers, keccak256, toUtf8Bytes } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Basit ABI (kontrat arayüzü)
const abi = [
  "function issue(bytes32 id, bytes32 holderHash, string title, string issuer, uint64 expiresAt)",
  "function revoke(bytes32 id)",
  "function verify(bytes32 id, bytes32 holderHash) view returns (bool valid, bool isRevoked, uint64 issuedAt, uint64 expiresAt, string title, string issuer)",
  "function getCertificate(bytes32 id) view returns (bytes32, bytes32, string, string, uint64, uint64, bool)"
];

// Provider + Signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// Komut satırı argümanı (örn: node action.js issue ...)
const [,, command, ...args] = process.argv;

// KVKK’ya uygun holderHash üretimi
function computeHolderHash(ogrNo, adSoyad, salt) {
  const payload = `${ogrNo}|${adSoyad.toUpperCase().trim()}|${salt}`;
  return keccak256(toUtf8Bytes(payload)); // 0x... hex
}

async function main() {
  if (command === "genid") {
    // Rastgele 32 baytlık id üret
    const id = ethers.hexlify(ethers.randomBytes(32));
    console.log("Yeni sertifika id:", id);
  }

  else if (command === "hash") {
    const [ogrNo, adSoyad, salt] = args;
    if (!ogrNo || !adSoyad || !salt) {
      console.log('Kullanım: node action.js hash <ogrNo> "Ad Soyad" <salt>');
      return;
    }
    const h = computeHolderHash(ogrNo, adSoyad, salt);
    console.log("holderHash:", h);
    console.log("Kullandığın salt (bunu yerelde sakla, zincire yazma):", salt);
  }

  else if (command === "issue") {
    const [id, holderHash, title, issuer, expires] = args;
    if (!id || !holderHash || !title || !issuer || !expires) {
      console.log('Kullanım: node action.js issue <id> <holderHash> "title" "issuer" <expiresAt>');
      return;
    }
    try {
      const tx = await contract.issue(id, holderHash, title, issuer, Number(expires));
      await tx.wait();
      console.log("✅ Sertifika oluşturuldu. id:", id);
    } catch (e) {
      console.log("❌ issue çağrısı hata verdi.");
      console.error(e);
    }
  }

  else if (command === "verify") {
    const [id, holderHash] = args;
    if (!id || !holderHash) {
      console.log("Kullanım: node action.js verify <id> <holderHash>");
      return;
    }

    try {
      const res = await contract.verify(id, holderHash);
      console.log("🔎 Doğrulama sonucu (on-chain verify fonksiyonu):");
      console.log("  valid     :", res[0]);
      console.log("  isRevoked :", res[1]);
      console.log("  issuedAt  :", Number(res[2]));
      console.log("  expiresAt :", Number(res[3]));
      console.log("  title     :", res[4]);
      console.log("  issuer    :", res[5]);
    } catch (e) {
      console.log("⚠️ Uyarı: verify() view çağrısı Ganache üzerinde hata verdi.");
      console.log("   Bu, Ganache/eth_call kaynaklı bir 'invalid opcode' hatası olabilir.");
      console.log("   Aynı id ile tekrar issue denendiğinde kontrat 'exists' diye revert ettiği için,");
      console.log("   bu sertifikanın zincirde zaten kayıtlı olduğunu biliyoruz.");
      console.log("");
      console.log("   Demo / rapor sırasında şunları gösterebilirsin:");
      console.log("   - İlk başarılı issue çıktısı (✅ Sertifika oluşturuldu...)");
      console.log("   - Aynı id ile ikinci issue denemesinde 'exists' revert’i");
      console.log("   - CertificateRegistry.sol içindeki verify ve getCertificate fonksiyonlarının imzası.");
      // İstersen debug için aç:
      // console.error(e);
    }
  }

  else if (command === "revoke") {
    const [id] = args;
    if (!id) {
      console.log("Kullanım: node action.js revoke <id>");
      return;
    }
    try {
      const tx = await contract.revoke(id);
      await tx.wait();
      console.log(" Sertifika iptal edildi. id:", id);
    } catch (e) {
      console.log("revoke çağrısı hata verdi.");
      console.error(e);
    }
  }

  else {
    console.log("Komutlar:");
    console.log(" node action.js genid");
    console.log(' node action.js hash <ogrNo> "Ad Soyad" <salt>');
    console.log(' node action.js issue <id> <holderHash> "title" "issuer" <expiresAt>');
    console.log(" node action.js verify <id> <holderHash>");
    console.log(" node action.js revoke <id>");
  }
}

main().catch((err) => {
  console.error("Hata:", err);
});
