/**
 * Created by snappler on 13/03/14.
 */

PinkCircleMarker = L.CircleMarker.extend( {
  options: {},
  initialize: function () {
    L.CircleMarker.prototype.initialize.call( this, [0, 0], {color: '#f06eaa', radius: 5} );
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  }
} );
