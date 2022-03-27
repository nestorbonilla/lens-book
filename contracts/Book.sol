// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract BookV1 is ERC721URIStorage, Ownable {
    event MintedBookNFT(
        address indexed minter,
        uint256 indexed bookId,
        uint256 indexed tokenId
    );
    using Counters for Counters.Counter;

    // Books
    struct Book {
        uint256 collectionBookId;
        address author;
        uint256 maxMint;
    }

    Counters.Counter private tokenIds;

    Counters.Counter private collectionBookIds;

    // Used for mint verification

    mapping(address => bool) public activeAuthor;

    string public baseURI;

    mapping(uint256 => Book) public books; // collectionBookId => Book

    mapping(uint256 => uint256[]) public tokenIdsByCollectionBookId;

    mapping(uint256 => uint256) public tokenIdByBookId;

    mapping(uint256 => Counters.Counter) public currentBookIdByCollectionBookId;

    modifier onlyActiveAuthor(address _author) {
        require(activeAuthor[_author], "only active author");
        _;
    }

    constructor() ERC721("LensBook", "LBOOK") {}

    receive() external payable {}

    function setBaseURI(string calldata _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setActiveAuthor(address _author) public onlyOwner {
        activeAuthor[_author] = true;
    }

    function setBook(uint256 _maxMint) public onlyActiveAuthor(msg.sender) {
        collectionBookIds.increment();

        books[collectionBookIds.current()] = Book({
            collectionBookId: collectionBookIds.current(),
            author: msg.sender,
            maxMint: _maxMint
        });
    }

    // IPFS hash will be unique for each nft due its encrypted url
    function mint(uint256 _collectionBookId, string calldata ipfsHash)
        public
        payable
    {
        Book memory _book = books[_collectionBookId];

        // verify an user is minting a book of an active author

        require(activeAuthor[_book.author], "disabled author");

        Counters.Counter
            storage _currentBookId = currentBookIdByCollectionBookId[
                _collectionBookId
            ];

        require(
            _book.maxMint > _currentBookId.current(),
            "max mint for this book reached"
        );

        tokenIds.increment();

        uint256[] storage _tokenIds = tokenIdsByCollectionBookId[
            _collectionBookId
        ];

        _tokenIds.push(tokenIds.current());

        _currentBookId.increment();

        tokenIdByBookId[_currentBookId.current()];

        _mint(msg.sender, tokenIds.current());

        _setTokenURI(tokenIds.current(), ipfsHash);

        emit MintedBookNFT(
            msg.sender,
            _currentBookId.current(),
            tokenIds.current()
        );
    }

    function getTokenIdsByCollectionBookId(uint256 _collectionBookId)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory _tokenIds = tokenIdsByCollectionBookId[
            _collectionBookId
        ];

        return _tokenIds;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function getTokenURIByBookId(uint256 _bookId)
        public
        view
        returns (string memory)
    {
        return tokenURI(tokenIdByBookId[_bookId]);
    }

    function getBookCountByCollectionBookId(uint256 _collectionBookId)
        public
        view
        returns (uint256)
    {
        return tokenIdsByCollectionBookId[_collectionBookId].length;
    }
}
