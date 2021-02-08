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
let decimals;
let monitorLimitPrice = false;
const chainId = ChainId.MAINNET;
const EXCHANGE_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
let TOKEN_ADDRESS;
let SELL_PRICE;
let TOKEN_AMOUNT;

class LimitOrderSellComponent extends Component { 
    constructor(props){
        super(props)
        this.state = {
            account: '',
            gasprice: 0,
            tokenAddress: '',
            sellprice: 0,
            tokenAmount: 0,
            marketPrice: 0,
            tokenBalance: 0,
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

        const tbalance = await tokenContract.balanceOf(this.state.account);
        decimals = await tokenContract.decimals();
        const balance = ethers.utils.formatUnits(tbalance.toString(), decimals);
        this.setState({tokenBalance: balance.toString()});

        cryptoPrice = await price.getCryptoPrice('USD', 'ETH');
        ethUSDPrice = cryptoPrice.price;
        ethPerToken = 1 / parseFloat(route.midPrice.toSignificant(6));
        tokenPrice = ethUSDPrice * ethPerToken;
        this.setState({marketPrice: tokenPrice});
    }

    async start(){
        SELL_PRICE = this.state.sellprice;
        TOKEN_AMOUNT = this.state.tokenAmount;

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

            console.log('limit sell price : ', SELL_PRICE);
            console.log('token price : ', tokenPrice);
            
            if(tokenPrice >= SELL_PRICE){
                console.log('place sell order..');
                const amountIn = ethers.utils.parseUnits(TOKEN_AMOUNT.toString());
                const amountInHex = ethers.BigNumber.from(amountIn.toString()).toHexString();
                const amountOutMin = (0.0002 * 10 ** decimals);
                const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
                const path = [token.address, weth.address];
                const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
                const deadlineHex = ethers.BigNumber.from(deadline.toString()).toHexString();
                const gasPrice = await web3HD.eth.getGasPrice();
                
                // do the swap
                const tx = await uniswap.swapExactTokensForETH(
                    amountInHex,
                    amountOutMinHex,
                    path,
                    this.state.account,
                    deadlineHex,
                    { 
                        gasPrice: ethers.BigNumber.from(gasPrice).toHexString(),
                        gasLimit: web3HD.utils.toHex(400000)
                    }
                );
                window.alert('limit order sell transaction : ' +  tx.hash);
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
                <label><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Limit Price (Sell)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
                <input
                type="text"
                value={this.state.value}
                onChange={(event) => {
                    this.setState({sellprice: this.sellprice.value})
                }}
                ref={(sellprice) => { this.sellprice = sellprice }}
                placeholder="0"
                required
                />
            </div>
            <br />
            <div>
                <label><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Token Amount&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b></label>
                <input
                type="text"
                value={this.state.value}
                onChange={(event) => {
                    this.setState({tokenAmount: this.tokenAmount.value})
                }}
                ref={(tokenAmount) => { this.tokenAmount = tokenAmount }}
                placeholder="0"
                required
                />
            </div>
            <br />
            <br />
            <div>
                <span className="float-center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button type="submit" variant="success">SELL</Button>
                </span>
            </div>
            <br />
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Token Balance : {this.state.tokenBalance}</span>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Token Market Price ($) : {this.state.marketPrice}</span>
            <div><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.botstatus}</b></div>
        </div>
        </form>
        )
    }
}

export default LimitOrderSellComponent;
