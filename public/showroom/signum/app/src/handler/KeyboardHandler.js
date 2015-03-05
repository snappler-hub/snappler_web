/**
 * Created by snappler on 18/06/14.
 */
KeyboardHandler= L.Class.extend({
/*  keyCode: {
    BACKSPACE:8,
    COMMA:188,
    DELETE:46,
    DOWN:40,
    END:35,
    ENTER:13,
    ESCAPE:27,
    HOME:36,
    LEFT:37,
    NUMPAD_ADD:107,
    NUMPAD_DECIMAL:110,
    NUMPAD_DIVIDE:111,
    NUMPAD_ENTER:108,
    NUMPAD_MULTIPLY:106,
    NUMPAD_SUBTRACT:109,
    PAGE_DOWN:34,
    PAGE_UP:33,
    PERIOD:190,
    RIGHT:39,
    SPACE:32,
    TAB:9,
    UP:38
  },
  key: {
    27:'Esc',
    37:'Left',
    38:'Up',
    39:'Right',
    40:'Down',
    46:'Del'
  },*/
  initialize:function(){
    key('esc',this.handleEsc );
    key('ctrl+e', this.handleCtrle );
    key('ctrl+x', this.handleCtrlx );
    key('ctrl+c', this.handleCtrlc );
    key('ctrl+v', this.handleCtrlv );
    key('ctrl+del', this.handleCtrlDel );

    key('del', this.handleDel );

    key('up', this.handleUp );
    key('down', this.handleDown );
    key('left', this.handleLeft );
    key('right', this.handleRight );

    key('ctrl+up', this.handleCtrlUp );
    key('ctrl+down', this.handleCtrlDown );
    key('ctrl+left', this.handleCtrlLeft );
    key('ctrl+right', this.handleCtrlRight );

    //DISABLE BROWSER FONT RESIZE
    $(document).on('keydown', function(event){
      if(event.ctrlKey) {
        switch(event.key){
          case "+":
          case "-":
          case "0":
            event.preventDefault();
            break;
          default:
            break;
        }
      }
    });
  },
  handleEsc:function(){
    Map.getInstance().cancelCurrentTool();
  },
  handleCtrle:function(){
    Map.getInstance().editAllLines();
    return false;
  },
  handleCtrlx:function(){
    if(Map.selectionBoxHandler!==undefined){
      Map.selectionBoxHandler._nextCenter=Map.selectionBoxHandler._lastCenter;
      if(!Map.selectionBoxHandler._toPaste){
        Map.getInstance().once('click', Map.selectionBoxHandler.indicatorToMove, Map.selectionBoxHandler);
        Map.selectionBoxHandler._toPaste=true;
        Map.selectionBoxHandler._action='cut';
      }
    }
    return false;
  },

  handleCtrlc:function(){
    if(Map.selectionBoxHandler!==undefined){
      Map.selectionBoxHandler._nextCenter=Map.selectionBoxHandler._lastCenter;
      if(!Map.selectionBoxHandler._toPaste){
        Map.getInstance().once('click', Map.selectionBoxHandler.indicatorToMove, Map.selectionBoxHandler);
        Map.selectionBoxHandler._toPaste=true;
        Map.selectionBoxHandler._action='copy';
      }
    }
    return false;
  },
  handleCtrlv:function(){
    if(Map.selectionBoxHandler!==undefined){
      if(Map.selectionBoxHandler._nextCenterIndicator!==undefined){
        Map.getInstance().getAuxLayer().removeLayer(Map.selectionBoxHandler._nextCenterIndicator);
        if(Map.selectionBoxHandler._action==='copy'){
          Map.selectionBoxHandler.cloneGroupedLayer();
        }
        Map.selectionBoxHandler.moveSelection(Map.selectionBoxHandler._nextCenter);
        Map.selectionBoxHandler._nextCenterIndicator=undefined;
        Map.selectionBoxHandler._toPaste=false;
//        Map.selectionBoxHandler._nextCenter=Map.selectionBoxHandler._lastCenter;
        Map.selectionBoxHandler.removeBoxSelection();
      }
    }
    return false;
  },
  handleCtrlDel:function(){
    if(Map.selectionBoxHandler!==undefined){
      Map.selectionBoxHandler._groupedLayer.eachLayer(function(l){
        Map.selectionBoxHandler._groupedLayer.removeLayer( l );
      });

      Map.selectionBoxHandler.removeBoxSelection();
    }
    return false;
  },
  handleDel:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleDel'])
        Map.getInstance()._selected.handleDel();
  },
  handleUp:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleUp'])
        Map.getInstance()._selected.handleUp();
  },
  handleDown:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleDown'])
        Map.getInstance()._selected.handleDown();
  },
  handleLeft:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleLeft'])
        Map.getInstance()._selected.handleLeft();
  },
  handleRight:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleRight'])
        Map.getInstance()._selected.handleRight();
  },

  handleCtrlUp:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleCtrlUp'])
        Map.getInstance()._selected.handleCtrlUp();
  },
  handleCtrlDown:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleCtrlDown'])
        Map.getInstance()._selected.handleCtrlDown();
  },
  handleCtrlLeft:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleCtrlLeft'])
        Map.getInstance()._selected.handleCtrlLeft();
  },
  handleCtrlRight:function(){
    if(Map.getInstance()._selected)
      if(Map.getInstance()._selected['handleCtrlRight'])
        Map.getInstance()._selected.handleCtrlRight();
  }
});