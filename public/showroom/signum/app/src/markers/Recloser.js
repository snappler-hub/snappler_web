/**
 * Created by snappler on 11/08/14.
 */
Recloser=Marker.extend( {
  initialize: function ( source, zoom, icon) {
    this.property={
      name:"Reconectador"
    };
    Marker.prototype.initialize.call( this, source, zoom, icon );
    this.property.klass='Recloser';
    return this;
  },

  scaleSize: function ( currentZoom ) {
    var tmp_size=Marker.prototype.scaleSize.call( this, currentZoom );
    return (tmp_size===undefined)? Marker.BASE_SIZE[0] : tmp_size;
  }
} );