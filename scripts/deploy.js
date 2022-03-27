
const { ethers } = require("hardhat");

async function main() {

  let [admin, author, minter] = ['', '', ''];
  [admin, author, minter] = await ethers.getSigners();

  const adminAddress = await admin.getAddress();
  const authorAddress = await author.getAddress();
  const minterAddress = await minter.getAddress();

  console.log("admin address: ", adminAddress);
  console.log("author address: ", authorAddress);
  console.log("minter address: ", minterAddress);

  const BookV1 = await ethers.getContractFactory('BookV1');
  const bookV1 = await BookV1.connect(admin).deploy();
  await bookV1.deployed();
  
  console.log("BookV1 contract was deployed to: ", bookV1.address);

  console.log("Admin set the author address...");
  await bookV1.connect(admin).setActiveAuthor(authorAddress);
  console.log("Admin set the base uri...");
  await bookV1.connect(admin).setBaseURI('https://alexandrialabs.mypinata.cloud/ipfs/');

  console.log("Author create a new book struct...");
  await bookV1.connect(author).setBook(100);

  console.log("Smart contract ready to mint nfts of book 1...");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
