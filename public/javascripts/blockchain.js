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

function validRef(chain, block, chainSize, tx, txSize){
  if(block==1){
    return true;
  }
  
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

function updateChain(chain, block, chainSize) {
  for (var i = block; i <= chainSize; i++) {
    if (i > 1) {
      $('#chain'+chain+'block'+i+'prev').val($('#chain'+chain+'block'+(i-1).toString()+'hash').val());
    }
    updateHash(chain, i);
  }
}