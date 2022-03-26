
const { ethers } = require("hardhat");

async function main() {

  let [admin, author, minter] = ['', '', ''];
  [admin, author, minter] = await ethers.getSigners();

  const BookV1 = await ethers.getContractFactory('BookV1');
  bookV1 = await BookV1.connect(admin).deploy();
  await bookV1.deployed();
  
  console.log("BookV1 contract was deployed to: ", bookV1.address);

  const authorAddress = await author.getAddress();
  console.log("Admin set the author address...");
  await bookV1.connect(admin).setActiveAuthor(authorAddress);
  console.log("Admin set the base uri...");
  await bookV1.connect(admin).setBaseURI(process.env.IPFS_GATEWAY);

  console.log("Author create a new book struct...");
  await bookV1.connect(author).setBook(15);

  console.log("Smart contract ready to mint nfts of book 1...");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
