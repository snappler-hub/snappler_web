/**
 * Created by snappler on 20/08/14.
 */
Box=Marker.extend( {
  initialize: function ( source, zoom, icon) {
    this.property={
      name:"Caja"
    };

    Marker.prototype.initialize.call( this, source, zoom, icon );
    return this;
  },

  scaleSize: function ( currentZoom ) {
    var tmp_size=Marker.prototype.scaleSize.call( this, currentZoom );
    return (tmp_size===undefined)? 0 : tmp_size;
  }
} );
