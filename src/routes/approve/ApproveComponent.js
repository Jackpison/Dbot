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
let provider;
let signer;
let tokenContract;
const chainId = ChainId.MAINNET;
const EXCHANGE_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
let TOKEN_ADDRESS;

class ApproveComponent extends Component { 
    constructor(props){
        super(props)
        this.state = {
            account: '',
            gasprice: 0,
            tokenAddress: '',
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
        console.log(this.state.account);
        
        // WEB3 CONFIG
        web3 = new Web3(process.env.REACT_APP_RPC_WEB_SCOKET);
        web3HD = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_RPC_HTTP));
        provider = new ethers.getDefaultProvider(process.env.REACT_APP_RPC_HTTP);
        const privateKey = new Buffer.from(process.env.REACT_APP_PRIVATE_KEY, "hex");
        signer = new ethers.Wallet(privateKey, provider);
    }

    async start(){
        TOKEN_ADDRESS = this.state.tokenAddress;    
        // declare the token contract interfaces
        tokenContract = new ethers.Contract(
            TOKEN_ADDRESS,
            ['function balanceOf(address owner) external view returns (uint)',
            'function decimals() external view returns (uint8)',
            'function approve(address spender, uint value) external returns (bool)'],
            signer
        );
        const gasLimit = 400000;
        const TOKENS = web3HD.utils.toHex('115792089237316195423570985008687907853269984665640564039457584007913129639935');
        const gasPrice = await web3HD.eth.getGasPrice();
        const newGasPrice = Math.floor(gasPrice * 1.4);

        const approve = await tokenContract.approve(
            EXCHANGE_ADDRESS, 
            TOKENS,
            { 
                gasPrice: ethers.BigNumber.from(newGasPrice).toHexString(),
                gasLimit: ethers.BigNumber.from(gasLimit).toHexString()
            }
        );
        console.log('approve tx: ', approve.hash);
        const botstatus = 'Approve Transaction Hash: ' + approve.hash
        this.setState({botstatus: botstatus});
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
            <br />
            <div>
                <span className="float-center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button type="submit" variant="success">Approve</Button>
                </span>
            </div>
            <br />
            <div><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.botstatus}</b></div>
        </div>
        </form>
        )
    }
}

export default ApproveComponent;
