import Web3 from 'web3'

export const GetWeb3 = async (dispatch) => {
  let web3
  if (window.ethereum) {
    web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert("Non ethereum browser. Please add Metamask extention to chrome and try again.")
  }
  //dispatch(web3Loaded(web3))
  return web3
}

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]
  //dispatch(web3AccountLoaded(account))
  return account
}
