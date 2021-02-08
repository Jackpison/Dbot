import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import '../../components/App.css';
import { GetWeb3 } from '../../store/web3';
require('dotenv').config();
const Web3 = require('web3');
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Pair, Token } = require('@uniswap/sdk');
const ethers = require('ethers');
const price = require('crypto-price');

let web3;
let web3HD;
let token;
let route;
let weth;
let provider;
let signer;
let uniswap;
let tokenContract;
let tokenPrice;
let priceMonitor;
let ethUSDPrice;
let cryptoPrice;
let ethPerToken;
let monitorLimitPrice = false;
const chainId = ChainId.MAINNET;
const EXCHANGE_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
let TOKEN_ADDRESS;
let BUY_PRICE;
let ETH_AMOUNT;

class LimitOrderBuyComponent extends Component { 
    constructor(props){
        super(props)
        this.state = {
            account: '',
            gasprice: 0,
            tokenAddress: '',
            buyprice: 0,
            ethAmount: 0,
            marketPrice: 0,
            botstatus: '',
            transactions: []
        }
        this.tokenAddressAdded = this.tokenAddressAdded.bind(this);
        this.monitorTokenPrice = this.monitorTokenPrice.bind(this);
    }

    componentWillMount() {
        this.loadblockchain()
    }
    
    async loadblockchain() {
        window.web3 = await GetWeb3();
        const accounts = await window.web3.eth.getAccounts();
        this.setState({account: accounts[0]});
        console.log(this.state.account);
        
        // WEB3 CONFIG
        web3 = new Web3(process.env.REACT_APP_RPC_WEB_SCOKET);
        web3HD = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_RPC_HTTP));
        provider = new ethers.getDefaultProvider(process.env.REACT_APP_RPC_HTTP);
        const privateKey = new Buffer.from(process.env.REACT_APP_PRIVATE_KEY, "hex");
        signer = new ethers.Wallet(privateKey, provider);
    }

    async tokenAddressAdded(tokenAddress){
        TOKEN_ADDRESS = tokenAddress;
        // declare the token contract interfaces
        tokenContract = new ethers.Contract(
          TOKEN_ADDRESS,
          ['function balanceOf(address owner) external view returns (uint)',
            'function decimals() external view returns (uint8)',
            'function approve(address spender, uint value) external returns (bool)'],
          signer
        );
        // declare the Uniswap contract interface
        uniswap = new ethers.Contract(
          EXCHANGE_ADDRESS,
          ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
            'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'],
          signer
        );
        token = await Fetcher.fetchTokenData(chainId, TOKEN_ADDRESS);
        weth = WETH[chainId];
        const pair = await Fetcher.fetchPairData(token, weth, provider);
        route = new Route([pair], weth);

        cryptoPrice = await price.getCryptoPrice('USD', 'ETH');
        ethUSDPrice = cryptoPrice.price;
        ethPerToken = 1 / parseFloat(route.midPrice.toSignificant(6));
        tokenPrice = ethUSDPrice * ethPerToken;
        this.setState({marketPrice: tokenPrice});
    }

    async start(){
        BUY_PRICE = this.state.buyprice;
        ETH_AMOUNT = this.state.ethAmount;

        const POLLING_INTERVAL = 1000;
        priceMonitor = setInterval(async () => { await this.monitorTokenPrice() }, POLLING_INTERVAL);
    }

    async monitorTokenPrice(){
        if(monitorLimitPrice) {
            return;
        }
        monitorLimitPrice = true;
        
        try {
            cryptoPrice = await price.getCryptoPrice('USD', 'ETH');
            ethUSDPrice = cryptoPrice.price;
            ethPerToken = 1 / parseFloat(route.midPrice.toSignificant(6));
            tokenPrice = ethUSDPrice * ethPerToken;
            this.setState({marketPrice: tokenPrice});

            console.log('limit buy price : ', BUY_PRICE);
            console.log('token price : ', tokenPrice);
            
            if(tokenPrice <= BUY_PRICE){
                console.log('place buy order..');
                const _ethAmount = ethers.utils.parseEther(ETH_AMOUNT);
                const trade = new Trade(route, new TokenAmount(weth, _ethAmount), TradeType.EXACT_INPUT);
                
                const slippageTolerance = new Percent('15000', '1000');
                const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
                const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
                const path = [weth.address, token.address];
                const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
                const inputAmount = trade.inputAmount.raw;
                const deadlineHex = ethers.BigNumber.from(deadline.toString()).toHexString();
                const inputAmountHex = ethers.BigNumber.from(inputAmount.toString()).toHexString();
                const gasPrice = await web3HD.eth.getGasPrice();

                // do the swap
                const tx = await uniswap.swapExactETHForTokens(
                    amountOutMinHex,
                    path,
                    this.state.account,
                    deadlineHex,
                    { 
                        value: inputAmountHex, 
                        gasPrice: ethers.BigNumber.from(gasPrice).toHexString(),
                        gasLimit: web3HD.utils.toHex(400000)
                    }
                );
                window.alert('limit order buy transaction : ' +  tx.hash);
                let transactionReceipt;
                do {
                    transactionReceipt = await web3HD.eth.getTransactionReceipt(tx.hash);
                }
                while(transactionReceipt === null);
                clearInterval(priceMonitor);
            }
        } catch (error) {
            console.error(error);
            monitorLimitPrice = false;
            clearInterval(priceMonitor);
            return
        }
        monitorLimitPrice = false;
    }

    render() {
        return (
        <form className="mb-4" onSubmit={(event) => {
            event.preventDefault()
            this.start()
          }}>
        <div>
            <div>
                <label><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Token Address&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
                <input
                className="form-control form-control-lg"
                type="text"
                value={this.state.value}
                onChange={(event) => {
                    this.setState({tokenAddress: this.tokenAddress.value})
                    this.tokenAddressAdded(this.tokenAddress.value)
                }}
                ref={(tokenAddress) => { this.tokenAddress = tokenAddress }}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                required />
                <br />
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.tokenAddress}</span>
            </div>
            <br />
            <div>
                <label><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Limit Price (Buy)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
                <input
                type="text"
                value={this.state.value}
                onChange={(event) => {
                    this.setState({buyprice: this.buyprice.value})
                }}
                ref={(buyprice) => { this.buyprice = buyprice }}
                placeholder="0"
                required
                />
            </div>
            <br />
            <div>
                <label><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ETH Amount&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
                <input
                type="text"
                value={this.state.value}
                onChange={(event) => {
                    this.setState({ethAmount: this.ethAmount.value})
                }}
                ref={(ethAmount) => { this.ethAmount = ethAmount }}
                placeholder="0"
                required
                />
            </div>
            <br />
            <br />
            <div>
                <span className="float-center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button type="submit" variant="success">BUY</Button>
                </span>
            </div>
            <br />
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Token Market Price ($) : {this.state.marketPrice}</span>
            <div><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.botstatus}</b></div>
        </div>
        </form>
        )
    }
}

export default LimitOrderBuyComponent;
