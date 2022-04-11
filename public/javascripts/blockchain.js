function updateHash(chain, block) {
  $('#chain'+chain+'block'+block+'hash').val(sha256(chain, block)); 
}

function updateBlockchain(chain, block, chainSize) {
  updateHash(chain, block);

  for(var i = 2; i<=chainSize; i++){
    if($('#chain'+chain+'block'+(i-1).toString()+'magic').val()!=$('#chain'+chain+'block'+i+'magic').val() ||
      parseInt($('#chain'+chain+'block'+(i-1).toString()+'blockid').val())!=parseInt($('#chain'+chain+'block'+i+'blockid').val())-1 ||
      $('#chain'+chain+'block'+(i-1).toString()+'hash').val()!=$('#chain'+chain+'block'+i+'prev').val()){

        $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');

        if($('#chain'+chain+'block'+(i-1).toString()+'hash').val()!=$('#chain'+chain+'block'+i+'prev').val()){  //previous and current hash DON'T match
          $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('bg-light').addClass('card-error');
          $('#chain'+chain+'block'+(i-1).toString()+'hash').addClass('input-error');
          $('#chain'+chain+'block'+i+'prev').addClass('input-error');
        }
        else{ //previous and current hash match
          if(i-1==1)
            $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('card-error').addClass('bg-light'); //novo dodato
          $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');
          $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
        }

        if($('#chain'+chain+'block'+(i-1).toString()+'magic').val()!=$('#chain'+chain+'block'+i+'magic').val()){  //magic number has an error
          $('#chain'+chain+'block'+i+'magic').addClass('input-error');
        }
        else{ //magic number has NO error
          $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
        }

        if(parseInt($('#chain'+chain+'block'+(i-1).toString()+'blockid').val())!=parseInt($('#chain'+chain+'block'+i+'blockid').val())-1){  //block id has an error
          $('#chain'+chain+'block'+i+'blockid').addClass('input-error');
        }
        else{ //block id has NO error
          $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
        }
    }
    else{ //no error in current block
      if($('#chain'+chain+'block'+(i-1).toString()+'card').hasClass('card-error')){ //previous card had an error
        $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');
        if(i-1==1){ //previous card was the first card in the chain
          $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('card-error').addClass('bg-light');
          $('#chain'+chain+'block'+i+'card').removeClass('card-error').addClass('bg-light');
        }
        else{ //previous card was NOT the first card in the chain
          $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');
        }
      }
      else{ //previous card had NO errors
        $('#chain'+chain+'block'+(i-1).toString()+'card').removeClass('card-error').addClass('bg-light');
        $('#chain'+chain+'block'+(i-1).toString()+'hash').removeClass('input-error');
        $('#chain'+chain+'block'+i+'card').removeClass('card-error').addClass('bg-light');
      }

      $('#chain'+chain+'block'+i+'magic').removeClass('input-error');
      $('#chain'+chain+'block'+i+'blockid').removeClass('input-error');
      $('#chain'+chain+'block'+i+'prev').removeClass('input-error');
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