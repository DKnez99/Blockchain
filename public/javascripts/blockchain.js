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
  console.log(`Block: ${block}, Tx: ${tx}`);
  if(block==1){
    return true;
  }

  var spentSum = parseFloat($('#chain'+chain+'block'+block+'tx'+tx+'value').val())+parseFloat($('#chain'+chain+'block'+block+'tx'+tx+'returnedValue').val());
  var allowedSum = 0;
  const sender = $('#chain'+chain+'block'+block+'tx'+tx+'from').val();

  const refArray = $('#chain'+chain+'block'+block+'tx'+tx+'ref').val().split(' ');

  refArray.sort(function(a, b){return a - b});
  console.log(`References: ${refArray}`);
  //array is empty || there are duplicates or block greater || equal than the current one is referenced
  if(refArray.length==0 || (new Set(refArray)).size!==refArray.length || refArray[refArray.length-1]>=block){ 
    console.log(`References not valid`);
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
        console.log(`Sender ${sender} not found in block ${i}`);
        return false;
      }
    }
    else{ //if this block isn't referenced
      for(let k = 0; $('#chain'+chain+'block'+i+'tx'+k+'value').length>0; k++){ //go through all tx in that block
        if($('#chain'+chain+'block'+i+'tx'+k+'from').val()==sender){
          let kRefArray = $('#chain'+chain+'block'+i+'tx'+k+'ref').val().split(' ');
          console.log(`kRefArray: ${kRefArray}`);
          console.log(`Overlap: ${refArray.filter(x=>kRefArray.includes(x))}`);
          let tempArray = refArray;
          if(tempArray.filter(x=>kRefArray.includes(x)).length!=0){  //if arrays overlap
            console.log(`Already used reference in block: ${i}`);
            return false;
          }
        }
      }
    }
  }

  console.log(`Allowed: ${allowedSum}, Spent: ${spentSum}`);
  console.log(' ');
  return allowedSum==spentSum;
}

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

      for(let k = 0; $('#chain'+chain+'block'+block+'tx'+k+'value').length>0; k++){ //go through all tx in block
        $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
        $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
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

        for(let k = 0; $('#chain'+chain+'block'+block+'tx'+k+'value').length>0; k++){ //go through all tx in block
          if(!validRef(chain, i, k)){
            $('#chain'+chain+'block'+i+'tx'+k+'ref').addClass('input-error');
          }
          else{
            $('#chain'+chain+'block'+i+'tx'+k+'ref').removeClass('input-error');
          }

          if(!validValue(chain, i, k)){
            $('#chain'+chain+'block'+i+'tx'+k+'value').addClass('input-error');
          }
          else{
            $('#chain'+chain+'block'+i+'tx'+k+'value').removeClass('input-error');
          }

          if(!validReturnedFrom(chain, i, k)){
            $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').addClass('input-error');
          }
          else{
            $('#chain'+chain+'block'+i+'tx'+k+'returnedFrom').removeClass('input-error');
          }
          
          if(!validReturnedTo(chain, i, k)){
            $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').addClass('input-error');
          }
          else{
            $('#chain'+chain+'block'+i+'tx'+k+'returnedTo').removeClass('input-error');
          }
        }
    }
  }
}