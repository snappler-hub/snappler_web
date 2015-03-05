/**
 * Created by snappler on 16/07/14.
 */
ImageMarker=Marker.extend({
  initialize:function ( zoom ) {
    var options = {
      icon: L.AwesomeMarkers.icon({
        prefix:'fa',
        icon: 'camera',
        markerColor: 'green'
      }),
      draggable: true,
      contextmenu: true,
      contextmenuItems: [ ]
    };

    this.defineContextMenuItems( options );

    L.Marker.prototype.initialize.call( this, new L.LatLng( 0, 0 ), options );

    this.property={
      angleRotated : 0,

      iconSize : Marker.BASE_SIZE.clone(),
      currentSize: new L.Point( Marker.BASE_SIZE[0], Marker.BASE_SIZE[0] ) ,

      border:undefined,

      _labelMarkers : [],
      linesConnecteds : [],
      indexOnLinesConnecteds : [],
      image:"app/assets/images/img.jpg",
      klass:'ImageMarker'
    };

    this.attachEvents();
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getMarkerLayer();
  },
  attachEvents:function(){
    Marker.prototype.attachEvents.call(this);

    this.off('dragstart');
    this.off('drag');
    this.off('dragend');
  },
  defineContextMenuItems:function(options){
    var self = this;
    options.contextmenuItems = [
      {separator: true},
      { text: '<b>Imagen</b>' },
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
            callback: function(answer) {
              if(answer)
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
    Application.showFancyBox(this.property.image);
  },


  updateIconSize: L.Util.falseFn,
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