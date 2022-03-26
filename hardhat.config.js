require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://localhost:8545",
      /*
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)
      */
    },
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [ process.env.ADMIN_PRIVATE_KEY, process.env.AUTHOR_PRIVATE_KEY, process.env.USER_PRIVATE_KEY ],
      gas: 2100000, gasPrice: 8000000000
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC,
      accounts: [ process.env.ADMIN_PRIVATE_KEY, process.env.AUTHOR_PRIVATE_KEY, process.env.USER_PRIVATE_KEY ]
    }
  }
};
