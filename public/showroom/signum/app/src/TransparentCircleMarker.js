/**
 * Created by snappler on 13/03/14.
 */

TransparentCircleMarker = L.CircleMarker.extend( {
  options: {},
  initialize: function (type, owner) {
    L.CircleMarker.prototype.initialize.call( this, [0, 0], {color: '#f06eaa', radius: 10, opacity:0.2} );
    this.property = {type: type};
    this.line=owner;

    this.getBelongingLayer().addLayer( this );
    return this;
  },
  getBelongingLayer:function(){
    return Map.getInstance().getAuxLayer();
  },
  concatenateWith: function(vertex){
    var newLatLngs;
    switch (vertex.property.type){
      case 'start':
        newLatLngs=vertex.concatenateTo(this);
        break;

      case 'last':
        newLatLngs=vertex.concatenateReversedTo(this);
        break;
    }

    vertex.line.setLatLngs(newLatLngs);
  },
  concatenateTo:function (vertex){
    switch (vertex.property.type){
      case 'start':
        return vertex.line.getLatLngs().reverse().clone().concat(this.line.getLatLngs().clone());
        break;

      case 'last':
        return vertex.line.getLatLngs().clone().concat(this.line.getLatLngs().clone());
        break;
    }
  },
  concatenateReversedTo:function (vertex){
    switch (vertex.property.type){
      case 'start':
        return vertex.line.getLatLngs().reverse().clone().concat(this.line.getLatLngs().reverse().clone());
        break;

      case 'last':
        return vertex.line.getLatLngs().clone().concat(this.line.getLatLngs().reverse().clone());
        break;
    }
  },
  continueLineFromMe: function(){
    switch (this.property.type){
      case 'start':
        this.line.continueLineFromStart();
      break;

      case 'last':
        this.line.continueLineFromEnd();
        break;
    }
  },

  clickHandler: function ( ev ) {
    if ( Map.getInstance()._currentTool ) {
      if ( /*(Map.getInstance()._currentTool.property.type == 'polyline') &&*/
        (Map.getInstance()._currentTool.description.type == this.line.description.type) &&
        (Map.getInstance()._currentTool.description.dashed == this.line.description.dashed) ) {

        if ( Map.getInstance()._currentTool !== this.line ) {
          if ( Map.getInstance()._currentTool.getLatLngs().length > 0 ) {
            if ( confirm( '¿Desea unir el nuevo tendido con el tendido que se ha clickeado?' ) ) {

              if ( Map.getInstance()._currentTool.vertexClicked === undefined ) {
                Map.getInstance()._currentTool.updateLastVertex();
                Map.getInstance()._currentTool.vertexClicked = Map.getInstance()._currentTool.lastVertex;
              }

              Map.getInstance()._currentTool.vertexClicked.concatenateWith( this );

              if ( Map.getInstance()._currentTool !== this.line ) {
                Map.getInstance()._currentTool.close();
              }

              this.line.redraw();
              this.line.updateStartVertex();
              this.line.updateLastVertex();

              Map.getInstance().cancelCurrentTool();
            }
            else {
              ev.latlng = this.getLatLng();
            }
          }
          else {
            this.line.vertexClicked = this;
            this.continueLineFromMe();
            Map.getInstance()._closingVertexMarker.off( 'click' );
            var v = this;

            Map.getInstance().showTooltip();

            Map.getInstance()._closingVertexMarker.on( 'click', function () {
              v.line.calculateDistance();
              v.setLatLng( Map.getInstance()._closingVertexMarker.getLatLng() );
              Map.getInstance().hideTooltip();
              Map.getInstance().cancelCurrentTool();
            } );
          }
        }else{
          console.warn("Traying to close startVertex with lastVertex of the same line");
          //TODO: Manage ring lines
        }
      }
      else {
        ev.latlng = this.getLatLng();
        Map.getInstance()._currentTool.onMapClick( ev );
      }
    }
  }
} );
