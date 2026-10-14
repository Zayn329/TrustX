// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofRegistry {
    mapping(bytes32 => bool) public anchoredProofs;
    bytes32 private constant DOMAIN_TYPEHASH = keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)');
    bytes32 private constant PROOF_TYPEHASH = keccak256('ProofAnchor(string researcherDid,string bountyId,bytes32 proofHash,uint256 nonce)');
    bytes32 public immutable DOMAIN_SEPARATOR;

    event ProofAnchored(
        bytes32 indexed proofHash,
        uint256 indexed bountyId,
        string researcherDid,
        address indexed signer,
        bytes signature,
        uint256 nonce
    );

    constructor() {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256(bytes('Trust Engine Protocol')),
            keccak256(bytes('1.0')),
            block.chainid,
            address(this)
        ));
    }

    function anchorProof(
        uint256 bountyId,
        bytes32 proofHash,
        string calldata researcherDid,
        bytes calldata signature,
        uint256 nonce
    ) external {
        require(proofHash != bytes32(0), 'Invalid proof hash');
        require(bytes(researcherDid).length > 0, 'Missing researcher DID');
        require(signature.length > 0, 'Missing proof signature');
        require(!anchoredProofs[proofHash], 'Proof already anchored');

        bytes32 structHash = keccak256(abi.encode(
            PROOF_TYPEHASH,
            keccak256(bytes(researcherDid)),
            keccak256(bytes(_uintToString(bountyId))),
            proofHash,
            nonce
        ));
        bytes32 digest = keccak256(abi.encodePacked('\x19\x01', DOMAIN_SEPARATOR, structHash));
        require(_recover(digest, signature) == msg.sender, 'Signature signer mismatch');

        anchoredProofs[proofHash] = true;
        emit ProofAnchored(proofHash, bountyId, researcherDid, msg.sender, signature, nonce);
    }

    function _recover(bytes32 digest, bytes calldata signature) private pure returns (address) {
        require(signature.length == 65, 'Invalid signature length');
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, 'Invalid signature recovery id');
        return ecrecover(digest, v, r, s);
    }

    function _uintToString(uint256 value) private pure returns (string memory) {
        if (value == 0) return '0';
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
