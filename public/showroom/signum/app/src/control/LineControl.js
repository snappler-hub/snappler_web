/**
 * Created by snappler on 14/03/14.
 */
LineControl = L.Control.extend( {
  options: {
    position: 'topleft',

    buttons: [
      {
        title: 'Linea BT',
        text: 'Linea BT',
        options: {
          type: 'BT',
          color: '#ff00ff',
          dashed: false
        }
      },
      {
        title: 'Linea BT Punteada',
        text: 'Linea BT Punteada',
        options: {
          type: 'BT',
          color: '#ff00ff',
          dashed: true
        }
      },
      {
        title: 'Linea MT',
        text: 'Linea MT',
        options: {
          type: 'MT',
          color: '#0000ff',
          dashed: false
        }
      },
      {
        title: 'Linea MT Punteada',
        text: 'Linea MT Punteada',
        options: {
          type: 'MT',
          color: '#0000ff',
          dashed: true
        }
      }
    ]
  },

  onAdd: function ( map ) {
    var self = this;
    var controlDiv = L.DomUtil.create( 'div', '' );

    this.actions = L.DomUtil.create( 'ul', 'leaflet-actions', controlDiv );

    for ( var i = 0; i < self.options.buttons.length; i++ ) {
      Util._createButton( {
        title: self.options.buttons[i].title,
        text: self.options.buttons[i].text,
        container: L.DomUtil.create( 'li', '', this.actions ),
        options: self.options.buttons[i].options,
        actions: this.actions,
        callback: this.createLine
      } );
    }

    L.DomEvent
      .addListener( controlDiv, 'click', L.DomEvent.stopPropagation )
      .addListener( controlDiv, 'click', L.DomEvent.preventDefault )
      .addListener( controlDiv, 'click', function () {
        $( self.actions ).fadeToggle( 'fast' );

        //Hide Polygon controls
        $( Map.getInstance().controls[Map.CTRL_POLYGON].actions ).hide();
      } );

    var controlUI = L.DomUtil.create( 'div', 'leaflet-control-custom leaflet-control-line-interior', controlDiv );
    controlUI.title = 'Lineas';
    return controlDiv;
  },

  createLine: function ( options ) {
    if( Map.getInstance()._editableLine !== undefined ) Map.getInstance().controls[Map.CTRL_CURSOR].updateEdit();

    Map.getInstance().setCurrentTool(new Line( options ));
    Application.setCrosshairCursor();
    Map.getInstance().showVertexesOfSameType();
  }
} );



$('.line').on('click', function(e){
  var classes=$(this).attr('class' ).replace('line ', '' ).split(' ');

  Map.getInstance().controls[Map.CTRL_LINE].createLine({
    type: classes[0].toUpperCase(),
    color: (classes[0] == 'mt')? '#0000ff': '#ff00ff',
    dashed: classes.length==2
  });
});