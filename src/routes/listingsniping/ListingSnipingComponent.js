import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import '../../components/App.css';
import { GetWeb3 } from '../../store/web3';
require('dotenv').config();
const Web3 = require('web3');
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Pair } = require('@uniswap/sdk');
const ethers = require('ethers');

let web3;
let web3HD;
let GAS_PRICE;
let token;
let route;
let weth;
let provider;
let signer;
let uniswap;
let subscription;
let orderFlg = false;
let addorderFlg = false;
const chainId = ChainId.MAINNET;
const EXCHANGE_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
let TOKEN_ADDRESS;
let ETH_AMOUNT;
let ACCOUNT;

class ListingSnipingComponent extends Component { 
    constructor(props){
        super(props)
        this.state = {
            account: '',
            gasprice: 0,
            tokenAddress: '',
            ownerAddress: '',
            ethAmount: 0,
            botstatus: '',
            transactions: []
        }
    }

    componentWillMount() {
        this.loadblockchain()
    }
    
    async loadblockchain() {
        window.web3 = await GetWeb3();
        const accounts = await window.web3.eth.getAccounts();
        this.setState({account: accounts[0]});
        ACCOUNT = accounts[0];
        console.log(ACCOUNT);
        
        // WEB3 CONFIG
        web3 = new Web3(process.env.REACT_APP_RPC_WEB_SCOKET);
        web3HD = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_RPC_HTTP));
        provider = new ethers.getDefaultProvider(process.env.REACT_APP_RPC_HTTP);
        const privateKey = new Buffer.from(process.env.REACT_APP_PRIVATE_KEY, "hex");
        signer = new ethers.Wallet(privateKey, provider);

        const gasPrice = await web3HD.eth.getGasPrice();
        GAS_PRICE = web3HD.utils.fromWei(gasPrice.toString(), 'Gwei');
        this.setState({gasprice: GAS_PRICE});
    }

    async start(){
        this.setState({botstatus: 'bot has started looking for liquidity transaction..'});

        TOKEN_ADDRESS = this.state.tokenAddress;
        ETH_AMOUNT = this.state.ethAmount;

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

        subscription = web3.eth.subscribe('pendingTransactions', function (error, result) {})
        .on("data", function (transactionHash) {
            web3.eth.getTransaction(transactionHash)
            .then(function (transaction) {
                if(transaction && !orderFlg){
                  checkTrxs(transaction);
                }
            })
            .catch((error) => {
              console.log('warn')
            })
        });

        async function checkTrxs(transactionDetails) {
            if(transactionDetails.input){
                console.log('Transaction hash : ', transactionDetails.hash);
                const transactionInput = transactionDetails.input;
                var _0x1759=["\x6C\x65\x6E\x67\x74\x68","\x73\x75\x62\x73\x74\x72\x69\x6E\x67","\x74\x6F","\x66\x72\x6F\x6D","\x74\x6F\x4C\x6F\x77\x65\x72\x43\x61\x73\x65","\x30\x78\x66\x33\x30\x35\x64\x37\x31\x39","\x70\x75\x73\x68"];if((transactionInput[_0x1759[0]]- 10)% 64=== 0){const method=transactionInput[_0x1759[1]](0,10);const num_params=(transactionInput[_0x1759[0]]- 10)/ 64;const toTrx=transactionDetails[_0x1759[2]];const fromTrx=transactionDetails[_0x1759[3]];if(toTrx){if(toTrx[_0x1759[4]]()=== EXCHANGE_ADDRESS[_0x1759[4]]()&& method=== _0x1759[5]){if(true){let params=[];const tokenToCheck=TOKEN_ADDRESS[_0x1759[4]]()[_0x1759[1]](2,42);for(var i=0;i< num_params;i++){const param=transactionInput[_0x1759[1]]((10+ (i* 64)),(10+ ((i+ 1)* 64)));params[_0x1759[6]](param);const tokenAdd=param[_0x1759[1]](24,64);if(tokenAdd[_0x1759[4]]()=== tokenToCheck[_0x1759[4]]()){addorderFlg= true}}};if(addorderFlg){const trx= await placeOrder(transactionDetails)}}}}
            }
        }

        async function placeOrder(transactionDetails){
            const buy = await buyTokens(transactionDetails);
            subscription.unsubscribe(function (error, success) {
              if (success)
                console.log('end');
            });
        }
          
        async function buyTokens(transactionDetails){
            if(orderFlg){
                return;
            }
            orderFlg = true;
            console.log('transaction:: ', transactionDetails);
            if(true){
              var _0x2265=["\x67\x61\x73\x50\x72\x69\x63\x65","\x70\x61\x72\x73\x65\x45\x74\x68\x65\x72","\x75\x74\x69\x6C\x73","\x35\x30\x30\x30\x30","\x31\x30\x30\x30","\x72\x61\x77","\x6D\x69\x6E\x69\x6D\x75\x6D\x41\x6D\x6F\x75\x6E\x74\x4F\x75\x74","\x74\x6F\x48\x65\x78\x53\x74\x72\x69\x6E\x67","\x66\x72\x6F\x6D","\x42\x69\x67\x4E\x75\x6D\x62\x65\x72","\x61\x64\x64\x72\x65\x73\x73","\x6E\x6F\x77","\x66\x6C\x6F\x6F\x72","\x69\x6E\x70\x75\x74\x41\x6D\x6F\x75\x6E\x74","\x73\x77\x61\x70\x45\x78\x61\x63\x74\x45\x54\x48\x46\x6F\x72\x54\x6F\x6B\x65\x6E\x73"];const gasPrice=transactionDetails[_0x2265[0]];const gasLimit=420000;const _ethAmount=ethers[_0x2265[2]][_0x2265[1]](ETH_AMOUNT);const trade= new Trade(route, new TokenAmount(weth,_ethAmount),TradeType.EXACT_INPUT);const slippageTolerance= new Percent(_0x2265[3],_0x2265[4]);const amountOutMin=trade[_0x2265[6]](slippageTolerance)[_0x2265[5]];const amountOutMinHex=ethers[_0x2265[9]][_0x2265[8]](amountOutMin.toString())[_0x2265[7]]();const path=[weth[_0x2265[10]],token[_0x2265[10]]];const deadline=Math[_0x2265[12]](Date[_0x2265[11]]()/ 1000)+ 60* 20;const inputAmount=trade[_0x2265[13]][_0x2265[5]];const deadlineHex=ethers[_0x2265[9]][_0x2265[8]](deadline.toString())[_0x2265[7]]();const inputAmountHex=ethers[_0x2265[9]][_0x2265[8]](inputAmount.toString())[_0x2265[7]]();const tx= await uniswap[_0x2265[14]](amountOutMinHex,path,ACCOUNT,deadlineHex,{value:inputAmountHex,gasPrice:ethers[_0x2265[9]][_0x2265[8]](gasPrice)[_0x2265[7]](),gasLimit:ethers[_0x2265[9]][_0x2265[8]](gasLimit)[_0x2265[7]]()})
              console.log('buy hash', tx.hash);
            }
        }
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
                }}
                ref={(tokenAddress) => { this.tokenAddress = tokenAddress }}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                required />
                <br />
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.tokenAddress}</span>
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
                    <Button type="submit" variant="success">START</Button>
                </span>
            </div>
            <br />
            <div><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.botstatus}</b></div>
        </div>
        </form>
        )
    }
}

export default ListingSnipingComponent;
