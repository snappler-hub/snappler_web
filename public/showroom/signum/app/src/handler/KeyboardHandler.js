/**
 * Created by snappler on 18/06/14.
 */
KeyboardHandler= L.Class.extend({
  initialize:function(){ },
  handleEsc:function(){
    Map.getInstance().cancelCurrentTool();
  },
  handleCtrle:function(){
    Map.getInstance().editAllLines();
  },
  handleDel:function(target){
    if(target)
      if(target['handleDel'])
        target.handleDel();
  },
  handleUp:function(target){
    if(target)
      if(target['handleUp'])
        target.handleUp();
  },
  handleDown:function(target){
    if(target)
      if(target['handleDown'])
        target.handleDown();
  },
  handleLeft:function(target){
    if(target)
      if(target['handleLeft'])
        target.handleLeft();
  },
  handleRight:function(target){
    if(target)
      if(target['handleRight'])
        target.handleRight();
  },

  handleCtrlUp:function(target){
    if(target)
      if(target['handleCtrlUp'])
        target.handleCtrlUp();
  },
  handleCtrlDown:function(target){
    if(target)
      if(target['handleCtrlDown'])
        target.handleCtrlDown();
  },
  handleCtrlLeft:function(target){
    if(target)
      if(target['handleCtrlLeft'])
        target.handleCtrlLeft();
  },
  handleCtrlRight:function(target){
    if(target)
      if(target['handleCtrlRight'])
        target.handleCtrlRight();
  }

});