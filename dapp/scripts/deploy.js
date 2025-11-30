import { network } from "hardhat";

async function main() {
  // Seçili network'e (bizde: localhost) bağlan
  const { ethers } = await network.connect();

  // CertificateRegistry kontratını deploy et
  const registry = await ethers.deployContract("CertificateRegistry");

  // Deploy bitmesini bekle
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("CertificateRegistry deployed at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
