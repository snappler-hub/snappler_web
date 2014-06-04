//Mensaje de Flash
function set_flash_msg(msg, type){
  var flash_msg = $('<div class="alert alert-'+type+'" style="margin-top:20px;display:none"><a class="close" data-dismiss="alert">&#215;</a><div>'+msg+'</div></div>');
  $("#flash_msg_container").html(flash_msg);
  flash_msg.fadeIn();
}
