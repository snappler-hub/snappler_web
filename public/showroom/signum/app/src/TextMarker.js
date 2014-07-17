TextMarker = L.Marker.extend( {
  options: { },

  initialize: function ( owner, textObject, zoom ) {
    console.log(owner);
    icon = new L.DivIcon( {
      className: 'textMarker',
      iconSize: [],
      iconAnchor: [],
      html: '<div><span style="font-weight: bold;">'+textObject.title+'</span><br/><span style="font-size:0.9em;">'+textObject.text+'</span></div>'
    } );

    this.property = {};
    var self=this;
    L.Marker.prototype.initialize.call( this, owner.getLatLng(), {
      icon: icon,
      draggable: true,
      contextmenu: true,
      contextmenuItems: [
        { separator: true },
        {
          text: 'Eliminar etiqueta',
          icon:'app/assets/images/minus.svg',
          callback: function(){
            self.remove();
          }
        }
      ]
    } );

    this.property._owner = owner;
    this.property.angleRotated = 0;

    this._calculateRotation();
    this.updateIconSize( zoom );

    var c = L.circle( owner.getLatLng(), 40, {
      stroke: true,
      color: '#00f',
      weight: 4
    } );

    var l = L.polyline( [], {
      stroke: true,
      color: '#fff',
      weight: 3,
      opacity: 0,
      clickable: false,
      dashArray: [5, 10]
    } );
    this.on( 'dragstart', function ( e ) {
      this.property._lastLatLng = this.getLatLng();

      c.setLatLng(owner.getLatLng());
      l.setLatLngs( [owner.getLatLng(), this.getLatLng()] );
      Map.getInstance().getAuxLayer().addLayer( c );
      Map.getInstance().getAuxLayer().addLayer( l );
    } );

    this.on( 'drag', function ( e ) {
      l.setLatLngs( [owner.getLatLng(), this.getLatLng()] );

      if ( Math.round( L.GeometryUtil.length( l ) ) > 40 ) {
        c.setStyle({
          stroke: true,
          color: '#F00',
          dashArray: [5, 10],
          weight: 2
        });
      }else{
        c.setStyle({
          stroke: true,
          color: '#00f',
          dashArray: [],
          weight: 2
        });
      }
    } );

    this.on( 'dragend', function ( e ) {
      this._calculateRotation();

      if ( Math.round( L.GeometryUtil.length( l ) ) > 40 ) {
        this.setLatLng( this.property._lastLatLng );
        delete this.property._lastLatLng;
      }

      Map.getInstance().getAuxLayer().removeLayer( l );
      Map.getInstance().getAuxLayer().removeLayer( c );
    } );

    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getTextLayer();
  },
  _calculateRotation: function () {
    this.setIconAngle( this.property.angleRotated );
  },
  rotate: function ( angle ) {
    this.property.angleRotated = angle % 360;
    this._calculateRotation();
  },
  updateIconSize: function ( ) { },

  relocateToOwner:function(){
    var ll = L.latLng(this.property._owner.getLatLng().lat - this._distanceToOwner.lat, this.property._owner.getLatLng().lng - this._distanceToOwner.lng);

    this.setLatLng( ll );
    this._distanceToOwner= {lat: 0, lng: 0};

  },
  calculateDistanceToOwner:function(){
    this._distanceToOwner = { lat: this.property._owner.getLatLng().lat - this.getLatLng().lat, lng: this.property._owner.getLatLng().lng - this.getLatLng().lng};
  },

  remove:function(){
    var i= this.property._owner.property._labelMarkers.indexOf(this);
    this.property._owner.property._labelMarkers.splice(i,1);

    this.getBelongingLayer().removeLayer( this );
  },
  toggle: function(){
    if ( this.getBelongingLayer().hasLayer( this ) ) this.getBelongingLayer().removeLayer( this );
    else this.getBelongingLayer().addLayer( this );
  }
} );