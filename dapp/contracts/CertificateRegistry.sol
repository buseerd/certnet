// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    address public owner;

    struct Certificate {
        bytes32 id;           // rastgele/UUID benzeri benzersiz kimlik
        bytes32 holderHash;   // (ogrNo + adSoyad + salt) gibi alanların keccak256 özeti
        string  title;        // sertifika/rozet adı
        string  issuer;       // kurum/birim adı
        uint64  issuedAt;     // unix epoch (saniye)
        uint64  expiresAt;    // 0 ise süresiz
        bool    revoked;      // iptal durumu
    }

    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(
        bytes32 indexed id,
        bytes32 indexed holderHash,
        string title,
        string issuer,
        uint64 issuedAt,
        uint64 expiresAt
    );

    event CertificateRevoked(bytes32 indexed id, uint64 revokedAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issue(
        bytes32 id,
        bytes32 holderHash,
        string calldata title,
        string calldata issuer,
        uint64 expiresAt
    ) external onlyOwner {
        require(certificates[id].issuedAt == 0, "exists");
        certificates[id] = Certificate(
            id,
            holderHash,
            title,
            issuer,
            uint64(block.timestamp),
            expiresAt,
            false
        );
        emit CertificateIssued(
            id,
            holderHash,
            title,
            issuer,
            uint64(block.timestamp),
            expiresAt
        );
    }

    function revoke(bytes32 id) external onlyOwner {
        Certificate storage c = certificates[id];
        require(c.issuedAt != 0, "not found");
        require(!c.revoked, "already revoked");
        c.revoked = true;
        emit CertificateRevoked(id, uint64(block.timestamp));
    }

    function verify(bytes32 id, bytes32 holderHash)
        external
        view
        returns (
            bool valid,
            bool isRevoked,
            uint64 issuedAt,
            uint64 expiresAt,
            string memory title,
            string memory issuer
        )
    {
        Certificate memory c = certificates[id];
        if (c.issuedAt == 0) {
            return (false, false, 0, 0, "", "");
        }
        bool ok = !c.revoked &&
            c.holderHash == holderHash &&
            (c.expiresAt == 0 || c.expiresAt >= block.timestamp);

        return (ok, c.revoked, c.issuedAt, c.expiresAt, c.title, c.issuer);
    }

    function getCertificate(bytes32 id)
        public
        view
        returns (
            bytes32 _id,
            bytes32 holderHash,
            string memory title,
            string memory issuer,
            uint64 issuedAt,
            uint64 expiresAt,
            bool revoked
        )
    {
        Certificate memory c = certificates[id];

        // hiç kayıt yoksa boş değerler döndürelim
        if (c.issuedAt == 0) {
            return (
                0x0,
                0x0,
                "",
                "",
                0,
                0,
                false
            );
        }

        return (
            c.id,
            c.holderHash,
            c.title,
            c.issuer,
            c.issuedAt,
            c.expiresAt,
            c.revoked
        );
    }
}
