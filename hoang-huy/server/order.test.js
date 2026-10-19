import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOrder} from './order.js';
const valid={name:'Nguyễn An',phone:'0912345678',address:'123 Nguyễn Huệ, TP.HCM',items:[{id:'tom-su',quantity:2,price:1}]};
test('prices are calculated by the server',()=>assert.equal(validateOrder(valid).total,640000));
test('rejects bad customer information',()=>{for(const fields of [{phone:'123'},{address:'abc'},{name:''}])assert.throws(()=>validateOrder({...valid,...fields}));});
test('rejects invalid, duplicate and excessive quantities',()=>{for(const items of [[],[{id:'fake',quantity:1}],[{id:'tom-su',quantity:-1}],[{id:'tom-su',quantity:1.5}],[{id:'tom-su',quantity:51}],[{id:'tom-su',quantity:1},{id:'tom-su',quantity:1}]])assert.throws(()=>validateOrder({...valid,items}));});
