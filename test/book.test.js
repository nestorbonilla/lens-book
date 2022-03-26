// load dependencies
const { use, expect, assert } = require('chai');
const { ethers, upgrades } = require('hardhat');

//start test genesis
describe('BookV1', function () {

    let [admin, author1, author2, minter1, minter2] = ['', '', '', ''];
    let bookV1;
    let author1BalancePreMint;

    beforeEach(async function () {
        [admin, author1, author2, minter1, minter2] = await ethers.getSigners();
    })

    //test
    it('BookV1 deploys.', async function() {
        const BookV1 = await ethers.getContractFactory('BookV1');
        bookV1 = await BookV1.deploy();
        await bookV1.deployed();
    })

    it('Owner can activate an author.', async function() {
        const author1Address = await author1.getAddress();
        const author2Address = await author2.getAddress();
        const minter1Address = await minter1.getAddress();
        const minter2Address = await minter2.getAddress();
        await bookV1.setActiveAuthor(author1Address);
        await bookV1.setActiveAuthor(author2Address);
        const isActive1 = await bookV1.activeAuthor(author1Address);
        const isActive2 = await bookV1.activeAuthor(author2Address);
        assert(isActive1 && isActive2, 'authors not active');
        const isActive3 = await bookV1.activeAuthor(minter1Address);
        const isActive4 = await bookV1.activeAuthor(minter2Address);
        assert(!(isActive3 && isActive4), 'minters should not be active');      
    })

    it('Owner can set the baseURI.', async function() {
        await bookV1.setBaseURI('https://gateway.com/ipfs/');
        const baseURI = await bookV1.baseURI();
        assert(baseURI == 'https://gateway.com/ipfs/', 'baseURI not set');
    })

    it('Author can create a book struct.', async function() {
        await bookV1.connect(author1).setBook(15);
        const book = await bookV1.books(1);
        assert(book.maxMint == 15, 'book not created properly');
    })

    it('User can mint a book providing a bookCollectionId.', async function() {
        const author1Address = await author1.getAddress();
        author1BalancePreMint = await ethers.provider.getBalance(author1Address);
        await bookV1.connect(minter1).mint(1, 'ABC', { value: ethers.utils.parseEther('1') });
        const tokenURI = await bookV1.tokenURI(1);
        assert(tokenURI == 'https://gateway.com/ipfs/ABC', 'book not minted properly');
    })

})