/**
 * Created by snappler on 26/06/14.
 */
VertexIndicator=L.Marker.extend({
  s:{
    "11":16,
    "12":16,
    "13":16,
    "14":16,
    "15":16,
    "16":16,
    "17":32,
    "18":32,
    "19":32,
    "20":32,
    "21":64,
    "22":64
  },

  initialize:function(lineOwner, latlng, i, markerBinded, isLimit ){
    var self =this;
    L.Marker.prototype.initialize.call( this, latlng, {
      icon:new L.DivIcon( {
        className: 'marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        html: '<img src="app/assets/images/vertex_indicator.svg"/>'

        /*      iconSize: [32, 32],
         iconAnchor: [16, 32],
         html: '<img src="app/assets/images/location.svg"/>'
         */
      } ),
      draggable: true,
      clickable: true,
      contextmenu: true,
      contextmenuItems: [{separator: true},
        {
          text: 'Eliminar vértice',
          icon:'app/assets/images/remove.svg',
          callback: function(){
            vex.dialog.confirm({
              message: "¿Esta seguro de eliminar este vertice?",
              callback: function() {
                self.remove( );
              }
            });
          }
        }]
    } );

    this._index=i;
    this.markerBinded=markerBinded;
    this.lineOwner=lineOwner;

    if(isLimit){
      this.on('dblclick', function( e){
        Map.getInstance().unsetSelected();
        this.lineOwner._keyBoardTarget = e.target;
        Map.getInstance().setSelected(this.lineOwner);
        this.markSelected();
      });
    }

/*    this.on( 'dragstart', function () {
      Map.getInstance().unsetSelected();
    });*/

    this.on( 'drag', function () {
      this.lineOwner.getLatLngs().splice( this._index, 1, this.getLatLng() );
      this.lineOwner.redraw();
    } );

    /*this.on('dragend',function(){
     if(this.markerBinded!== undefined){
     this.markerBinded.setLatLng(this.getLatLng());
     }
     });*/

    this.updateIconSize(Map.getInstance().getZoom());
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  },
  markSelected:function(){
    this.setIcon(new L.DivIcon( {
      className: 'marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      html: '<img src="app/assets/images/vertex_indicator_filled.svg"/>'
    } ));

    this.updateIconSize(Map.getInstance().getZoom());
  },
  unmarkSelected:function(){
    this.setIcon(new L.DivIcon( {
      className: 'marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      html: '<img src="app/assets/images/vertex_indicator.svg"/>'
    } ));
    
    this.updateIconSize(Map.getInstance().getZoom());
  },

  setBorder:function(){},

  remove:function(){
    this.lineOwner.getLatLngs().splice( this._index, 1);
    this.lineOwner.redraw();

    this.getBelongingLayer().removeLayer( this );
    this.fire("removed", {vertex: this});
  },

  updateIconSize: function (currentZoom) {
    var newSize= this.s[currentZoom];
    this._doResize( new L.Point( newSize, newSize )  );
  },
  _doResize: function ( newIconSize ) {
    var newIconAnchor = new L.Point( Math.round( newIconSize.x / 2 ), Math.round( newIconSize.y / 2 ) );

    var oldIconOptions = this.options.icon.options;
    oldIconOptions.iconSize = [newIconSize.x, newIconSize.x];
    oldIconOptions.iconAnchor = newIconAnchor;

    var srcAttr = $( oldIconOptions.html ).filter( 'img' ).attr( 'src' );

    oldIconOptions.html = '<img src="' + srcAttr + '" style="width:' + newIconSize.x + 'px; height:' + newIconSize.x + 'px;"/>'

    var newIcon = new L.DivIcon( oldIconOptions );
    this.setIcon( newIcon );
  }
});