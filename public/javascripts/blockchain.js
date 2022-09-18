function updateHash(chain, block) {
  $('#chain'+chain+'block'+block+'hash').val(sha256(chain, block)); 
}

function validBlockId(chain, block){
  if(block==1){
    return true;
  }
  return parseInt($('#chain'+chain+'block'+block+'blockid').val())==parseInt($('#chain'+chain+'block'+(block-1).toString()+'blockid').val())+1;
}

function validMagic(chain, block){
  if(block==1){
    return true;
  }
  return $('#chain'+chain+'block'+block+'magic').val()==$('#chain'+chain+'block'+(block-1).toString()+'magic').val();
}

function validPrev(chain, block){
  if(block==1){
    return true;
  }
  return $('#chain'+chain+'block'+block+'prev').val()==$('#chain'+chain+'block'+(block-1).toString()+'hash').val();
}

function validCoinbase(chain, block){
  //console.log(`Block ${block}: ${parseFloat(20.0/Math.pow(2,parseInt((block-1)/5)))}`);
  return parseFloat($('#chain'+chain+'block'+block+'coinvalue').val())==parseFloat(20.0/Math.pow(2,parseInt((block-1)/5)));
}

function validValue(chain, block, tx){
  return parseFloat($('#chain'+chain+'block'+block+'tx'+tx+'value').val())>0;
}

function validReturnedTo(chain, block, tx){
  return $('#chain'+chain+'block'+block+'tx'+tx+'from').val()==$('#chain'+chain+'block'+block+'tx'+tx+'returnedTo').val();
}

function validReturnedFrom(chain, block, tx){
  return $('#chain'+chain+'block'+block+'tx'+tx+'from').val()==$('#chain'+chain+'block'+block+'tx'+tx+'returnedFrom').val();
}

function validRef(chain, block, tx){
  //console.log(`Block: ${block}, Tx: ${tx}`);
  if(block==1){
    return true;
  }

  var spentSum = parseFloat($('#chain'+chain+'block'+block+'tx'+tx+'value').val())+parseFloat($('#chain'+chain+'block'+block+'tx'+tx+'returnedValue').val());
  var allowedSum = 0;
  const sender = $('#chain'+chain+'block'+block+'tx'+tx+'from').val();

  const refArray = $('#chain'+chain+'block'+block+'tx'+tx+'ref').val().split(' ');

  refArray.sort(function(a, b){return a - b});
  //console.log(`References: ${refArray}`);
  //array is empty || there are duplicates || referenced current block or greater
  if(refArray.length==0 || (new Set(refArray)).size!==refArray.length || refArray[refArray.length-1]>=block){ 
    //console.log(`References not valid`);
    return false;
  }

  var j = 1;
  for(let i = block-1; i>=refArray[0] || j<=refArray.length; i--){

    if(i==refArray[refArray.length-j]){ //if this block is referenced
      j++;

      let senderFound = false;

      if($('#chain'+chain+'block'+i+'cointo').val()==sender){ //add coinbase
        senderFound=true;
        allowedSum+=parseFloat($('#chain'+chain+'block'+i+'coinvalue').val());
      }

      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in that block
        if($('#chain'+chain+'block'+i+'tx'+k+'to').val()==sender){
          allowedSum+=parseFloat($('#chain'+chain+'block'+i+'tx'+k+'value').val());
          senderFound = true;
        }

        if($('#chain'+chain+'block'+i+'tx'+k+'returnedTo').val()==sender){
          allowedSum+=parseFloat($('#chain'+chain+'block'+i+'tx'+k+'returnedValue').val());
          senderFound = true;
        }
      }

      if(!senderFound){
        //console.log(`Sender ${sender} not found in block ${i}`);
        return false;
      }
    }
    else{ //if this block isn't referenced
      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in that block
        if($('#chain'+chain+'block'+i+'tx'+k+'from').val()==sender){
          let kRefArray = $('#chain'+chain+'block'+i+'tx'+k+'ref').val().split(' ');
          //console.log(`kRefArray: ${kRefArray}`);
          //console.log(`Overlap: ${refArray.filter(x=>kRefArray.includes(x))}`);
          let tempArray = refArray;
          if(tempArray.filter(x=>kRefArray.includes(x)).length!=0){  //if arrays overlap
            //console.log(`Already used reference in block: ${i}`);
            return false;
          }
        }
      }
    }
  }

  //console.log(`Allowed: ${allowedSum}, Spent: ${spentSum}`);
  //console.log(' ');
  return allowedSum==spentSum;
}

//go through previous/current blocks and find previous id
function validId(chain, block, tx){
  if(block==1){
    return true;
  }
  const currId=parseInt($('#chain'+chain+'block'+block+'tx'+tx+'id').val());
  const sender=$('#chain'+chain+'block'+block+'tx'+tx+'from').val()
  var senderFound=false;
  var prevId=-1;
  for(let i=block; i>=1; i--){
    if(i==block){//curr block
      for(let j=tx-1;j>=0;j--){
        if(sender==$('#chain'+chain+'block'+i+'tx'+j+'from').val()){
          return currId==(parseInt($('#chain'+chain+'block'+i+'tx'+j+'returnedId').val())+1);
        }
      }
    }
    else{//previous blocks
      for(let j = 0; $('#chain'+chain+'block'+i+'tx'+j+'value').length>0; j++){ //go through all tx in that block
        if(sender==$('#chain'+chain+'block'+i+'tx'+j+'from').val()){
          senderFound=true;
          prevId=parseInt($('#chain'+chain+'block'+i+'tx'+j+'returnedId').val());
        }
      }
      if(senderFound==true){
        return currId==(prevId+1);
      }
    }
  }
  return currId==1;
}


function validReturnedId(chain, block, tx){
  if(block==1){
    return true;
  }
  return parseInt($('#chain'+chain+'block'+block+'tx'+tx+'id').val())+1==parseInt($('#chain'+chain+'block'+block+'tx'+tx+'returnedId').val());
}

function validSignature(chain,block,tx){
  var EC = elliptic.ec;
  var ec = new EC('secp256k1');
  var temp;
  var msg=$('#chain'+chain+'block'+block+'tx'+tx+'id').val()+
          $('#chain'+chain+'block'+block+'tx'+tx+'value').val()+
          $('#chain'+chain+'block'+block+'tx'+tx+'from').val()+
          $('#chain'+chain+'block'+block+'tx'+tx+'to').val();
  //console.log('Msg: '+msg);
  try{
      var temp=ec.keyFromPublic($('#chain'+chain+'block'+block+'tx'+tx+'from').val(),'hex');
      //console.log('Stored sender\'s public key');
      var binaryMsg=buffer.Buffer.from(CryptoJS.SHA256(msg).toString(CryptoJS.enc.Hex));
      //console.log('Converted msg to binary');
      if(temp.verify(binaryMsg,$('#chain'+chain+'block'+block+'tx'+tx+'signature').val())){
          //console.log('Chain '+chain+', Block '+block+', Tx '+tx+'. Signature Matches!');
          return true;
      }
      else{
          //console.log('Chain '+chain+', Block '+block+', Tx '+tx+'. Signature Failed! Should be: '+binaryMsg.toString());
          return false;
      }
  }
  catch(e){
      //console.log('Chain '+chain+', Block '+block+', Tx '+tx+'. Signature Error! '+e.toString());
      return false;
  }
}

function validReturnedSignature(chain,block,tx){
  var EC = elliptic.ec;
  var ec = new EC('secp256k1');
  var temp;
  var msg=$('#chain'+chain+'block'+block+'tx'+tx+'returnedId').val()+
          $('#chain'+chain+'block'+block+'tx'+tx+'returnedValue').val()+
          $('#chain'+chain+'block'+block+'tx'+tx+'returnedFrom').val()+
          $('#chain'+chain+'block'+block+'tx'+tx+'returnedTo').val();
  
  //console.log('Msg: '+msg);
  try{
      var temp=ec.keyFromPublic($('#chain'+chain+'block'+block+'tx'+tx+'returnedFrom').val(),'hex');
      //console.log('Stored sender\'s public key');
      var binaryMsg=buffer.Buffer.from(CryptoJS.SHA256(msg).toString(CryptoJS.enc.Hex));
      //console.log('Converted msg to binary');
      if(temp.verify(binaryMsg,$('#chain'+chain+'block'+block+'tx'+tx+'returnedSignature').val())){
          //console.log('Chain '+chain+', Block '+block+', Tx '+tx+'. Returned Signature Matches!');
          return true;
      }
      else{
          //console.log('Chain '+chain+', Block '+block+', Tx '+tx+'. Returned Signature Failed! Should be: '+binaryMsg.toString());
          return false;
      }
  }
  catch(e){
      //console.log('Chain '+chain+', Block '+block+', Tx '+tx+'. Returned Signature Error! '+e.toString());
      return false;
  }
}

//basic transaction (no id's and signatures)
function validTx(chain, block){
  if(block==1){
    return true;
  }
  for(let k = 0; $('#chain'+chain+'block'+block+'tx'+k+'value').length>0; k++){ //go through all tx in block
    if(!validReturnedTo(chain, block, k) || !validReturnedFrom(chain, block, k) || !validRef(chain, block, k) || !validValue(chain, block, k)){
      return false;
    }
  }
  return true;
}

//transaction with id's and signatures
function validSignedTx(chain, block){
  if(block==1){
    return true;
  }
  for(let k = 0; $('#chain'+chain+'block'+block+'tx'+k+'value').length>0; k++){ //go through all tx in block
    if(!validReturnedTo(chain, block, k)  ||
      !validReturnedFrom(chain, block, k) ||
      !validRef(chain, block, k)          ||
      !validValue(chain, block, k)        ||
      !validReturnedId(chain, block, k)   ||
      !validId(chain,block,k)             ||
      !validSignature(chain,block,k)      ||
      !validReturnedSignature(chain,block,k)){
        return false;
    }
  }
  return true;
}

function validNonce(chain,block){
  var diff= parseInt($('#chain'+chain+'block'+block+'diff').val());
  var numOfZerosHex=diff/4;
  
  var hashStart = "0".repeat(numOfZerosHex);
  switch(diff%4){
      case 0:hashStart+="";break;
      case 1:hashStart+="7";break;
      case 2:hashStart+="3";break;
      case 3:hashStart+="1";break;
  }

  var currHash=$('#chain'+chain+'block'+block+'hash').val();

  if(currHash.startsWith(hashStart)){
    return true;
  }
  return false;
}

function updateBlockchain(chain, block, chainSize) {
  updateHash(chain, block);

  for(var i = 1; i<=chainSize; i++){

    if(validMagic(chain, i) && validBlockId(chain, i) && validPrev(chain, i)){  //no errors in the current block
      
      $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
      $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');

      if($('#chain'+chain+'block'+(i-1).toString()+'card').hasClass('card-error')){ //previous card had an error
        $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');
      }
      else{ //previous card had NO errors
        $('#chain'+chain+'block'+i+'card').removeClass('card-error').addClass('bg-light');
      }
    }
    else{ //error(s) in the current block
      $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');

        if(!validPrev(chain, i)){
          $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('bg-light').addClass('card-error');
          $('#chain'+chain+'block'+(i-1).toString()+'hash').addClass('input-error');
          $('#chain'+chain+'block'+i+'prev').addClass('input-error');
        }
        else{ //previous and current hash match
          $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');
          $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
        }

        if(!validMagic(chain, i)){
          $('#chain'+chain+'block'+i+'magic').addClass('input-error');
        }
        else{ //magic number has NO error
          $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
        }

        if(!validBlockId(chain, i)){
          $('#chain'+chain+'block'+i+'blockid').addClass('input-error');
        }
        else{ //block id has NO error
          $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
        }
    }
  }
}

function updateCoinbaseBlockchain(chain, block, chainSize) {
  updateHash(chain, block);

  for(var i = 1; i<=chainSize; i++){
    if(validMagic(chain, i) && validBlockId(chain, i) && validPrev(chain, i) && validCoinbase(chain, i) && validTx(chain, i)){  //no errors in the current block
      $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      $('#chain'+chain+'block'+i+'coinvalue').removeClass('input-error');
      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in block
        $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'from').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'to').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').removeClass('input-error');
      }
      $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
      $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');

      if($('#chain'+chain+'block'+(i-1).toString()+'card').hasClass('card-error')){ //previous card had an error
        $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');
      }
      else{ //previous card had NO errors
        $('#chain'+chain+'block'+i+'card').removeClass('card-error').addClass('bg-light');
      }
    }
    else{ //error(s) in the current block
      $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');

      if(!validPrev(chain, i)){
        //console.log('CHAIN '+chain+' BLOCK '+i+' previous');
        $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('bg-light').addClass('card-error');
        $('#chain'+chain+'block'+(i-1).toString()+'hash').addClass('input-error');
        $('#chain'+chain+'block'+i+'prev').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');
        $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
      }

      if(!validMagic(chain, i)){
        $('#chain'+chain+'block'+i+'magic').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      }
      if(!validBlockId(chain, i)){
        $('#chain'+chain+'block'+i+'blockid').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      }
      if(!validCoinbase(chain, i)){
        $('#chain'+chain+'block'+i+'coinvalue').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'coinvalue').removeClass('input-error');
      }

      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in block
        var refIsValid=true;
        var valueIsValid=true;
        var fromIsValid=true;
        var toIsValid=true;
        var returnedValueIsValid=true;
        var returnedFromIsValid=true;
        var returnedToIsValid=true;

        if(!validRef(chain, i, k)){
          refIsValid=false;
          valueIsValid=false;
          returnedValueIsValid=false;
          fromIsValid=false;
          returnedFromIsValid=false;
        }

        if(!validValue(chain, i, k)){
          valueIsValid=false;
        }

        if(!validReturnedFrom(chain, i, k)){
          fromIsValid=false;
          returnedFromIsValid=false;
        }
        
        if(!validReturnedTo(chain, i, k)){
          returnedToIsValid=false;
          returnedFromIsValid=false;
        }

        if(refIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'ref').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
        }

        if(valueIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'value').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
        }

        if(fromIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'from').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'from').removeClass('input-error');
        }

        if(toIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'to').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'to').removeClass('input-error');
        }

        if(returnedValueIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').removeClass('input-error');
        }

        if(returnedFromIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').removeClass('input-error');
        }

        if(returnedToIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').removeClass('input-error');
        }
      }
    }
  }
}

function updateSignedBlockchain(chain, block, chainSize) {
  updateHash(chain, block);

  for(var i = 1; i<=chainSize; i++){
    if(validMagic(chain, i) && validBlockId(chain, i) && validPrev(chain, i) && validCoinbase(chain, i) && validSignedTx(chain, i)){  //no errors in the current block
      $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      $('#chain'+chain+'block'+i+'coinvalue').removeClass('input-error');

      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in block
        $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'id').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'from').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'to').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'signature').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedId').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedSignature').removeClass('input-error');
      }

      $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
      $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');

      if($('#chain'+chain+'block'+(i-1).toString()+'card').hasClass('card-error')){ //previous card had an error
        $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');
      }
      else{ //previous card had NO errors
        $('#chain'+chain+'block'+i+'card').removeClass('card-error').addClass('bg-light');
      }
    }
    else{ //error(s) in the current block
      $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');

      if(!validPrev(chain, i)){
        $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('bg-light').addClass('card-error');
        $('#chain'+chain+'block'+(i-1).toString()+'hash').addClass('input-error');
        $('#chain'+chain+'block'+i+'prev').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');
        $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
      }

      if(!validMagic(chain, i)){
        $('#chain'+chain+'block'+i+'magic').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      }

      if(!validBlockId(chain, i)){
        $('#chain'+chain+'block'+i+'blockid').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      }

      if(!validCoinbase(chain, i)){
        $('#chain'+chain+'block'+i+'coinvalue').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'coinvalue').removeClass('input-error');
      }

      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in block
        var refIsValid=true;
        var idIsValid=true;
        var valueIsValid=true;
        var fromIsValid=true;
        var toIsValid=true;
        var signatureIsValid=true;
        var returnedIdIsValid=true;
        var returnedValueIsValid=true;
        var returnedFromIsValid=true;
        var returnedToIsValid=true;
        var returnedSignatureIsValid=true;

        if(!validRef(chain, i, k)){
          refIsValid=false;
          valueIsValid=false;
          returnedValueIsValid=false;
          fromIsValid=false;
          returnedFromIsValid=false;
        }

        if(!validId(chain, i, k)){
          idIsValid=false;
        }

        if(!validValue(chain, i, k)){
          valueIsValid=false;
        }

        if(!validSignature(chain,i,k)){
          signatureIsValid=false;
        }

        if(!validReturnedId(chain,i,k)){
          returnedIdIsValid=false;
        }

        if(!validReturnedFrom(chain, i, k)){
          fromIsValid=false;
          returnedFromIsValid=false;
        }
        
        if(!validReturnedTo(chain, i, k)){
          returnedToIsValid=false;
          returnedFromIsValid=false;
        }

        if(!validReturnedSignature(chain,i,k)){
          returnedSignatureIsValid=false;
        }

        if(refIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'ref').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
        }

        if(idIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'id').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'id').removeClass('input-error');
        }

        if(valueIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'value').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
        }

        if(fromIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'from').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'from').removeClass('input-error');
        }

        if(toIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'to').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'to').removeClass('input-error');
        }

        if(signatureIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'signature').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'signature').removeClass('input-error');
        }

        if(returnedIdIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedId').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedId').removeClass('input-error');
        }

        if(returnedValueIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').removeClass('input-error');
        }

        if(returnedFromIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').removeClass('input-error');
        }

        if(returnedToIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').removeClass('input-error');
        }

        if(returnedSignatureIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedSignature').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedSignature').removeClass('input-error');
        }
      }
    }
  }
}

function updateMiningBlockchain(chain, block, chainSize) {
  updateHash(chain, block);
  for(var i = 1; i<=chainSize; i++){
    if(validMagic(chain, i) && validBlockId(chain, i) && validPrev(chain, i) && validCoinbase(chain, i) && validSignedTx(chain, i) && validNonce(chain,i)){  //no errors in the current block
      $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      $('#chain'+chain+'block'+i+'coinvalue').removeClass('input-error');

      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in block
        $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'id').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'from').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'to').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'signature').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedId').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'returnedSignature').removeClass('input-error');
      }

      $('#chain'+chain+'block'+i+'diff').removeClass('input-error');
      $('#chain'+chain+'block'+i+'nonce').removeClass('input-error');
      $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
      $('#chain'+chain+'block'+i+'hash').removeClass('input-error');
      $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');

      if($('#chain'+chain+'block'+(i-1).toString()+'card').hasClass('card-error')){ //previous card had an error
        $('#chain'+chain+'block'+i+'card').removeClass('card-success').addClass('card-error');
      }
      else{ //previous card had NO errors
        $('#chain'+chain+'block'+i+'card').removeClass('card-error').addClass('card-success');
      }
    }
    else{ //error(s) in the current block
      $('#chain'+chain+'block'+i+'card').removeClass('card-success').addClass('card-error');

      if(!validPrev(chain, i)){
        $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('card-success').addClass('card-error');
        $('#chain'+chain+'block'+(i-1).toString()+'hash').addClass('input-error');
        $('#chain'+chain+'block'+i+'prev').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');
        $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
      }

      if(!validMagic(chain, i)){
        $('#chain'+chain+'block'+i+'magic').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      }

      if(!validBlockId(chain, i)){
        $('#chain'+chain+'block'+i+'blockid').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      }

      if(!validCoinbase(chain, i)){
        $('#chain'+chain+'block'+i+'coinvalue').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'coinvalue').removeClass('input-error');
      }

      if(!validNonce(chain, i)){
        $('#chain'+chain+'block'+i+'diff').addClass('input-error');
        $('#chain'+chain+'block'+i+'nonce').addClass('input-error');
        $('#chain'+chain+'block'+i+'hash').addClass('input-error');
      }
      else{
        $('#chain'+chain+'block'+i+'diff').removeClass('input-error');
        $('#chain'+chain+'block'+i+'nonce').removeClass('input-error');
        $('#chain'+chain+'block'+i+'hash').removeClass('input-error');
      }

      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in block
        var refIsValid=true;
        var idIsValid=true;
        var valueIsValid=true;
        var fromIsValid=true;
        var toIsValid=true;
        var signatureIsValid=true;
        var returnedIdIsValid=true;
        var returnedValueIsValid=true;
        var returnedFromIsValid=true;
        var returnedToIsValid=true;
        var returnedSignatureIsValid=true;

        if(!validRef(chain, i, k)){
          refIsValid=false;
          valueIsValid=false;
          returnedValueIsValid=false;
          fromIsValid=false;
          returnedFromIsValid=false;
        }

        if(!validId(chain, i, k)){
          idIsValid=false;
        }

        if(!validValue(chain, i, k)){
          valueIsValid=false;
        }

        if(!validSignature(chain,i,k)){
          signatureIsValid=false;
        }

        if(!validReturnedId(chain,i,k)){
          returnedIdIsValid=false;
        }

        if(!validReturnedFrom(chain, i, k)){
          fromIsValid=false;
          returnedFromIsValid=false;
        }
        
        if(!validReturnedTo(chain, i, k)){
          returnedToIsValid=false;
          returnedFromIsValid=false;
        }

        if(!validReturnedSignature(chain,i,k)){
          returnedSignatureIsValid=false;
        }

        if(refIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'ref').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
        }

        if(idIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'id').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'id').removeClass('input-error');
        }

        if(valueIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'value').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
        }

        if(fromIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'from').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'from').removeClass('input-error');
        }

        if(toIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'to').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'to').removeClass('input-error');
        }

        if(signatureIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'signature').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'signature').removeClass('input-error');
        }

        if(returnedIdIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedId').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedId').removeClass('input-error');
        }

        if(returnedValueIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedValue').removeClass('input-error');
        }

        if(returnedFromIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').removeClass('input-error');
        }

        if(returnedToIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').removeClass('input-error');
        }

        if(returnedSignatureIsValid==false){
          $('#chain'+chain+'block'+i+'tx'+k+'returnedSignature').addClass('input-error');
        }
        else{
          $('#chain'+chain+'block'+i+'tx'+k+'returnedSignature').removeClass('input-error');
        }
      }
    }
  }
}

function updateDistributedBlockchain(chain,block,chainSize){
  updateMiningBlockchain(chain,block,chainSize);
  valid1=true;
  valid2=true;
  valid3=true;
  if(!distributedBlockchainIsValid(1,chainSize)){
    $('#peerA').removeClass('text-success').addClass('text-danger');
    valid1=false;
  }
  if(!distributedBlockchainIsValid(2,chainSize)){
    $('#peerB').removeClass('text-success').addClass('text-danger');
    valid2=false;
  }
  if(!distributedBlockchainIsValid(3,chainSize)){
    $('#peerC').removeClass('text-success').addClass('text-danger');
    valid3=false;
  }

  if(valid1){
    if(!valid2 && !valid3){//only peer A is valid
      $('#peerA').removeClass('text-danger').addClass('text-success');
      return;
    }

    if(chainsMatch(1,2,chainSize) || chainsMatch(1,3,chainSize)){
      $('#peerA').removeClass('text-danger').addClass('text-success');
    }
    else{
      $('#peerA').removeClass('text-success').addClass('text-danger');
    }
  }

  if(valid2){
    if(!valid1 && !valid3){//only peer B is valid
      $('#peerB').removeClass('text-danger').addClass('text-success');
      return;
    }

    if(chainsMatch(2,1,chainSize) || chainsMatch(2,3,chainSize)){
      $('#peerB').removeClass('text-danger').addClass('text-success');
    }
    else{
      $('#peerB').removeClass('text-success').addClass('text-danger');
    }
  }

  if(valid3){
    if(!valid1 && !valid2){//only peer C is valid
      $('#peerC').removeClass('text-danger').addClass('text-success');
      return;
    }

    if(chainsMatch(3,1,chainSize) || chainsMatch(3,2,chainSize)){
      $('#peerC').removeClass('text-danger').addClass('text-success');
    }
    else{
      $('#peerC').removeClass('text-success').addClass('text-danger');
    }
  }
}

function distributedBlockchainIsValid(chain,chainSize){
  for(var i = 1; i<=chainSize; i++){  //go through curr chain
    if(!validMagic(chain, i)      ||
        !validBlockId(chain, i)   ||
        !validPrev(chain, i)      ||
        !validCoinbase(chain, i)  ||
        !validSignedTx(chain, i)  ||
        !validNonce(chain,i)){   
      return false;
    }
  }
  return true;
}

function chainsMatch(chainA, chainB, chainSize){
  for(var i = 1; i<=chainSize; i++){
    if($('#chain'+chainA+'block'+i+'hash').val()!=$('#chain'+chainB+'block'+i+'hash').val()){
      return false;
    }
  }
  return true;
}

function mine(chain, block, chainSize){
  document.querySelector('html').style.cursor='progress';
  x=0;
  while(true){
    $('#chain'+chain+'block'+block+'nonce').val(x++);
    updateHash(chain,block);
    if(validNonce(chain,block)){
      updateMiningBlockchain(chain, block, chainSize);
      break;
    }
  }
  document.querySelector('html').style.cursor='auto';
}

function mineDist(chain, block, chainSize){
  document.querySelector('html').style.cursor='progress';
  x=0;
  while(true){
    $('#chain'+chain+'block'+block+'nonce').val(x++);
    updateHash(chain,block);
    if(validNonce(chain,block)){
      updateDistributedBlockchain(chain, block, chainSize);
      break;
    }
  }
  document.querySelector('html').style.cursor='auto';
}