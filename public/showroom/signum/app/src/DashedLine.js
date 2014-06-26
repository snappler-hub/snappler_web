/**
 * Created by snappler on 13/03/14.
 */
DashedLine = L.Polyline.extend( {
  initialize: function (opt) {
    var polylineOptions = {
      stroke: true,
      color: (opt)? opt.color: '#f06eaa',
      weight: (opt)? opt.weight: 3,
      opacity: 0.8,
      fill: false,
      clickable: false,
      dashArray: [5, 5, 1, 5]
    };
    L.Polyline.prototype.initialize.call( this, [], polylineOptions );
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  }
} );

