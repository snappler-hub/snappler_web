/**
 * Created by snappler on 26/06/14.
 */
Border = L.Rectangle.extend({
  initialize:function(bounds){
    L.Rectangle.prototype.initialize.call( this, bounds, {color: "#0000cc", weight: 1, fill: false, dashArray: [5, 5]}  );
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  }
});