function changeDetected(chain, block) {
    // set the card background
    $('#chain'+chain+'block'+block+'card').removeClass('bg-light');
    $('#chain'+chain+'block'+block+'card').addClass('card-change-detected');
    //$('#chain'+chain+'block'+block+'card').removeClass('card-change-detected').addClass('bg-light');
    //$('#chain'+chain+'block'+block+'card').removeClass('card-change-detected');
  }
  
  function updateHash(chain, block) {
    $('#chain'+chain+'block'+block+'hash').val(sha256(chain, block));
    
  }
  
  function updateBlockchain(chain, block, chainSize) {  //ADD BLOCKID AND MAGIC CHECK
    updateHash(chain, block);
    for (var i = 1; i <= chainSize; i++) {
      if(($('#chain'+chain+'block'+i+'hash').val()!=$('#chain'+chain+'block'+(i+1).toString()+'prev').val() && i!=chainSize) || $('#chain'+chain+'block'+(i-1).toString()+'card').hasClass('card-error')){
        $('#chain'+chain+'block'+i+'card').removeClass('bg-light').addClass('card-error');
        if($('#chain'+chain+'block'+i+'hash').val()!=$('#chain'+chain+'block'+(i+1).toString()+'prev').val() && i!=chainSize){
          $('#chain'+chain+'block'+i+'hash').addClass('input-error');
          $('#chain'+chain+'block'+(i+1).toString()+'prev').addClass('input-error');
        }
      }
      else{
        $('#chain'+chain+'block'+i+'card').removeClass('card-error').addClass('bg-light');
        $('#chain'+chain+'block'+i+'hash').removeClass('input-error');
        $('#chain'+chain+'block'+(i+1).toString()+'prev').removeClass('input-error');
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