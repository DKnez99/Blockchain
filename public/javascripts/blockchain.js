// function updateState(block, chain) {
//     // set the well background red or green for this block
//     if ($('#block'+block+'chain'+chain+'hash').val().substr(0, difficulty) === pattern) {
//       $('#block'+block+'chain'+chain+'well').removeClass('well-error').addClass('well-success');
//     }
//     else {
//       $('#block'+block+'chain'+chain+'well').removeClass('well-success').addClass('well-error');
//     }
//   }
  
  function updateHash(chain, block) {
    $('#chain'+chain+'block'+block+'hash').val(sha256(chain, block));
    //updateState(block, chain);
  }
  
  function updateChain(chain, block, chainSize) {
    for (var i = block; i <= chainSize; i++) {
      if (i > 1) {
        $('#chain'+chain+'block'+i+'prev').val($('#chain'+chain+'block'+(i-1).toString()+'hash').val());
      }
      updateHash(chain, i);
    }
  }