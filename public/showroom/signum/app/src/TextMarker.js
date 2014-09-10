TextMarker = L.Marker.extend( {
  options: { },

  initialize: function ( owner, textObject, zoom ) {
    TextMarker.CANT_CREATED++;

    var tit=(textObject.title)?'<span class="textmarker-title" style="font-weight: bold;">'+textObject.title+'</span><br/>':'';
    var text=(textObject.text)?'<span class="textmarker-text">'+textObject.text+'</span>':'';

    var icon = new L.DivIcon( {
      className: 'textMarker textmarker_'+TextMarker.CANT_CREATED,
      iconSize: [120, 20],
      iconAnchor: [60 ,7],
      html: '<div>'+tit+text+'</div>'
    } );

    this.property = {
      id: TextMarker.CANT_CREATED,
      angleRotated: 0
    };
    var self=this;
    var ll;

    if((owner!==undefined)&&(typeof owner.getCenter==='function')){
      ll=owner.getCenter();
    }else{
      ll= new L.LatLng( 0, 0 );
    }

    L.Marker.prototype.initialize.call( this, ll, {
      icon: icon,
      draggable: true,
      contextmenu: true,
      contextmenuItems: [
        {separator: true},
        {
          text: 'Rotar icono',
          icon:'app/assets/images/rotate.svg',
          callback: function ( ) {
            Application.startWork('rotation', self);
          }
        },
        { separator: true },
        {
          text: 'Eliminar etiqueta',
          icon:'app/assets/images/minus.svg',
          callback: function(){
            vex.dialog.confirm({
              message: "¿Esta seguro de eliminar esta etiqueta?",
              callback: function() {
                self.remove( );
              }
            });
          }
        }
      ]
    } );
    this._calculateRotation();

    if(owner !== undefined ){
      this.property._owner = owner;
      this.property.distance=L.GeometryUtil.length([owner.getBounds().getNorthEast(), owner.getBounds().getSouthWest()]);

      this.property.circle= L.circle( owner.getCenter(), this.property.distance, {
        stroke: true,
        color: '#00f',
        weight: 4
      } );

      this.property.line = L.polyline( [], {
        stroke: true,
        color: '#fff',
        weight: 3,
        opacity: 0,
        clickable: false,
        dashArray: [5, 10]
      } );

      this.on( 'dragstart', function ( e ) {
        this.property._lastLatLng = this.getLatLng();

        this.property.circle.setLatLng(owner.getCenter());
        this.property.line.setLatLngs( [owner.getCenter(), this.getLatLng()] );

        Map.getInstance().getAuxLayer().addLayer( this.property.circle );
        Map.getInstance().getAuxLayer().addLayer( this.property.line );
      } );

      this.on( 'drag', function ( e ) {
        this.property.line.setLatLngs( [owner.getCenter(), this.getLatLng()] );

        if ( Math.round( L.GeometryUtil.length( this.property.line ) ) > this.property.distance ) {
          this.property.circle.setStyle({
            stroke: true,
            color: '#F00',
            dashArray: [5, 10],
            weight: 2
          });
        }else{
          this.property.circle.setStyle({
            stroke: true,
            color: '#00f',
            dashArray: [],
            weight: 2
          });
        }
      } );

      this.on( 'dragend', function ( e ) {
        this._calculateRotation();

        if ( Math.round( L.GeometryUtil.length( this.property.line ) ) > this.property.distance ) {
          this.setLatLng( this.property._lastLatLng );
          delete this.property._lastLatLng;
        }

        Map.getInstance().getAuxLayer().removeLayer( this.property.line );
        Map.getInstance().getAuxLayer().removeLayer( this.property.circle );

        this.calculateDistanceToOwner();
      } );


      owner.on('resize', function(){
        self.property.distance=L.GeometryUtil.length([owner.getBounds().getNorthEast(), owner.getBounds().getSouthWest()])/2;
        self.property.circle.setRadius(self.property.distance);
      });
    }

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
  updateIconSize: function ( z ) {
    $('.textmarker_'+this.property.id ).find('div').css('font-size', TextMarker.SIZE_TABLE[z]+"em");

    var size=[eval($('.textmarker_'+this.property.id ).css('width').replace('px','')),
              eval($('.textmarker_'+this.property.id ).css('height').replace('px',''))];

    this.property.currentSize = new L.Point(size[0],size[1]);
  },

  relocateToOwner:function(){
    var ll = L.latLng(this.property._owner.getCenter().lat - this._distanceToOwner.lat, this.property._owner.getCenter().lng - this._distanceToOwner.lng);

    this.setLatLng( ll );
  },
  resetDistanceToOwner:function(){
    this._distanceToOwner= {lat: 0, lng: 0};
  },
  calculateDistanceToOwner:function(){
    this._distanceToOwner = { lat: this.property._owner.getCenter().lat - this.getLatLng().lat, lng: this.property._owner.getCenter().lng - this.getLatLng().lng};
  },

  remove:function(){
    if(this.property._owner !== undefined ){
      var i= this.property._owner.property._labelMarkers.indexOf(this);
      this.property._owner.property._labelMarkers.splice(i,1);
    }

    this.getBelongingLayer().removeLayer( this );
  },
  toggle: function(){
    if ( this.getBelongingLayer().hasLayer( this ) ) this.getBelongingLayer().removeLayer( this );
    else this.getBelongingLayer().addLayer( this );
  }
} );

TextMarker.SIZE_TABLE={
  "15": 0.5,
  "16": 0.75,
  "17": 1,
  "18": 2,
  "19": 3,
  "20": 4,
  "21": 5,
  "22": 6
};

TextMarker.CANT_CREATED = 0;