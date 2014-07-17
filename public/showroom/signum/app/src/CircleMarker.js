/**
 * Created by snappler on 13/03/14.
 */
CircleMarker = L.CircleMarker.extend( {
  initialize: function () {
    L.CircleMarker.prototype.initialize.call( this, [0, 0], {radius: 5} );
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  }
} );
