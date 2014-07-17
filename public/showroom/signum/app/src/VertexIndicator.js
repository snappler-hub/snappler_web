/**
 * Created by snappler on 26/06/14.
 */
VertexIndicator=L.Marker.extend({
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
            self.remove();
          }
        }]
    } );

    this._index=i;
    this.markerBinded=markerBinded;
    this.lineOwner=lineOwner;

    if(isLimit){
      this.on('click', function( e){
        Map.getInstance().unsetSelected();
        this.lineOwner._keyBoardTarget = e.target;
        Map.getInstance().setSelected(this.lineOwner);
        this.markSelected();
      });
    }

    this.on( 'dragstart', function () {
      Map.getInstance().unsetSelected();
    });
    this.on( 'drag', function () {
      this.lineOwner.getLatLngs().splice( this._index, 1, this.getLatLng() );
      this.lineOwner.redraw();
    } );

    /*this.on('dragend',function(){
      if(this.markerBinded!== undefined){
        this.markerBinded.setLatLng(this.getLatLng());
      }
    });*/
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
  },
  unmarkSelected:function(){
    this.setIcon(new L.DivIcon( {
      className: 'marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      html: '<img src="app/assets/images/vertex_indicator.svg"/>'
    } ));
  },

  setBorder:function(){},

  remove:function(){
    this.lineOwner.getLatLngs().splice( this._index, 1);
    this.lineOwner.redraw();

    this.getBelongingLayer().removeLayer( this );
    this.fire("removed", {vertex: this});
  }
});