/**
 * Created by snappler on 14/03/14.
 */
DashedCircle = L.Circle.extend( {
  initialize: function ( point ) {
    var polylineOptions = {
      stroke: true,
      color: '#f06eaa',
      weight: 3,
      opacity: 0.8,
      fill: false,
      dashArray: [5, 5, 1, 5]
    };

    L.Circle.prototype.initialize.call( this, point, 0, polylineOptions );
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  }
} );