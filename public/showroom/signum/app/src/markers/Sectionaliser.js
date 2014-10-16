/**
 * Created by snappler on 11/08/14.
 */
Sectionaliser=Marker.extend( {
  initialize: function ( source, zoom, icon) {
    this.property={
      name:"Seccionalizador"
    };
    Marker.prototype.initialize.call( this, source, zoom, icon );
    this.property.klass='Sectionaliser';
    return this;
  },

  scaleSize: function ( currentZoom ) {
    var tmp_size=Marker.prototype.scaleSize.call( this, currentZoom );
    return (tmp_size===undefined)? 0 : tmp_size;
  }
} );