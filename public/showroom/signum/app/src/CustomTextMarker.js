/**
 * Created by gastonambrogi on 09/08/14.
 */
CustomTextMarker=Marker.extend({
    initialize:function ( text ) {
      var options = {
        icon: L.AwesomeMarkers.icon({
          prefix:'fa',
          icon: 'font',
          markerColor: 'blue'
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
        text:text
      };

      this.attachEvents();

      this.bindPopup(this.property.text);
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
        { text: '<b>Texto</b>' },
        {
          text: 'Ver texto',
          icon:'app/assets/images/bars.svg',
          callback: function ( ) {
            self.openPopup();
          }
        },
        {
          text: 'Eliminar marcador de texto',
          icon:'app/assets/images/remove.svg',
          callback: function ( ) {
            self.removeMarker( );
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
      //Application.showFancyBox(this.property.image);
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