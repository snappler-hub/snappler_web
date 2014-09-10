/**
 * Created by snappler on 03/09/14.
 */
PhotoMarker=Marker.extend({
  initialize:function ( zoom ) {
    var options = {
      icon: new L.DivIcon( {
        className: 'photo-marker',
        iconSize: PhotoMarker.BASE_SIZE,
        iconAnchor: PhotoMarker.BASE_ANCHOR,
        html: '<img src="app/assets/images/img.jpg" width="'+PhotoMarker.BASE_SIZE[0]+'" height="'+PhotoMarker.BASE_SIZE[1]+'"/>'
      } ),
      draggable: true,
      contextmenu: true,
      contextmenuItems: [ ]
    };

    this.defineContextMenuItems( options );

    L.Marker.prototype.initialize.call( this, new L.LatLng( 0, 0 ), options );

    this.property={
      angleRotated : 0,
      size_table: Util.clone(PhotoMarker.SIZE_TABLE),

      iconSize : PhotoMarker.BASE_SIZE.clone(),
      currentSize: new L.Point( PhotoMarker.BASE_SIZE[0], PhotoMarker.BASE_SIZE[1] ) ,

      border:undefined,

      _labelMarkers : [],
      linesConnecteds : [],
      indexOnLinesConnecteds : [],
      image:"app/assets/images/img.jpg"
    };

    this.attachEvents();
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getPhotoLayer();
  },
  attachEvents:function(){
    Marker.prototype.attachEvents.call(this);

    this.off('dragstart');
    this.off('drag');
    this.off('dragend');


    this.on( 'dragend', function ( e ) {
      this._calculateRotation();
    });
  },
  defineContextMenuItems:function(options){
    var self = this;
    options.contextmenuItems = [
      {separator: true},
      { text: '<b>Foto</b>' },
      {
        text: 'Ajustar tamaño',
        icon:'app/assets/images/expand.svg',
        callback: function ( ) {
          Application.startWork('resize', self);
        }
      },
      {separator: true},
      {
        text: 'Rotar icono',
        icon:'app/assets/images/rotate.svg',
        callback: function ( ) {
          Application.startWork('rotation', self);
        }
      },
      {separator: true},
      {
        text: 'Ver imagen',
        icon:'app/assets/images/image.svg',
        callback: function ( ) {
          Application.showFancyBox(self.property.image);
        }
      },
      {
        text: 'Eliminar imagen',
        icon:'app/assets/images/remove.svg',
        callback: function ( ) {
          vex.dialog.confirm({
            message: "¿Esta seguro de eliminar este marcador?",
            callback: function() {
              self.removeMarker( );
            }
          });
        }
      }
    ]
  },
  removeMarker: function ( e ) {
    this.removeBorder();
    this.getBelongingLayer().removeLayer( this );
    delete this;
  },

  onMarkerClick:function(e){
    Marker.prototype.onMarkerClick.call(this,e);
//    Application.showFancyBox(this.property.image);
  },
  setBorder:function(){
    this.property.border=undefined;
  },
  updateIconSize: function(z){},

  _doResize: function ( newIconSize ) {
    this.property.size_table[Map.getInstance().getZoom()]=newIconSize.x;
    this.property.currentSize = newIconSize;

    // adjust the icon anchor to the new size
    var newIconAnchor = new L.Point( Math.round( this.property.currentSize.x / 2 ), Math.round( this.property.currentSize.y / 2 ) );

    // finally, declare a new icon and update the marker
    var oldIconOptions = this.options.icon.options;
    oldIconOptions.iconSize = this.property.currentSize;
    oldIconOptions.iconAnchor = newIconAnchor;

    srcAttr = $( oldIconOptions.html ).filter( 'img' ).attr( 'src' );

    oldIconOptions.html = '<img src="' + srcAttr + '" style="width:' + this.property.currentSize.x + 'px; height:' + this.property.currentSize.x + 'px;"/>'

    var newIcon = new L.DivIcon( oldIconOptions );

    this.setIcon( newIcon );
  },
  handleCtrlLeft:L.Util.falseFn,
  handleCtrlRight:L.Util.falseFn,
  handleCtrlUp:L.Util.falseFn,
  handleCtrlDown:L.Util.falseFn,

  bindToBelowLines: L.Util.falseFn,
  bindLine: L.Util.falseFn,
  unbindLine: L.Util.falseFn,

  addLabel:L.Util.falseFn,
  removeLabels:L.Util.falseFn,
  showLabels:L.Util.falseFn,
  hideLabels:L.Util.falseFn
});

PhotoMarker.BASE_SIZE = [100, 100];
PhotoMarker.BASE_ANCHOR = [PhotoMarker.BASE_SIZE[0] / 2, PhotoMarker.BASE_SIZE[0] / 2];


PhotoMarker.SIZE_TABLE={
  "15": undefined,
  "16": PhotoMarker.BASE_SIZE[0]/2,
  "17": PhotoMarker.BASE_SIZE[0],
  "18": PhotoMarker.BASE_SIZE[0]*2,
  "19": PhotoMarker.BASE_SIZE[0]*4,
  "20": PhotoMarker.BASE_SIZE[0]*8,
  "21": PhotoMarker.BASE_SIZE[0]*16,
  "22": PhotoMarker.BASE_SIZE[0]*32
};