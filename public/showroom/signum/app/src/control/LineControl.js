/**
 * Created by snappler on 14/03/14.
 */
LineControl = L.Control.extend( {
  options: {
    position: 'topleft',

    /*buttons: [
      {
        title: 'Linea Alta Tension',
        text: 'Linea Alta Tension',
        options: {
          type: 'AT',
          color: '#FF0000',
          dashed: false
        }
      },
      {
        title: 'Linea Alta Tension Subterranea',
        text: 'Linea Alta Tension Subterranea',
        options: {
          type: 'AT',
          color: '#FF0000',
          dashed: true
        }
      },

      {
        title: 'Linea Media Tension',
        text: 'Linea Media Tension',
        options: {
          type: 'MT',
          color: '#0000ff',
          dashed: false
        }
      },
      {
        title: 'Linea Media Tension Subterranea',
        text: 'Linea Media Tension Subterranea',
        options: {
          type: 'MT',
          color: '#0000ff',
          dashed: true
        }
      },

      {
        title: 'Linea Baja Tension',
        text: 'Linea Baja Tension',
        options: {
          type: 'BT',
          color: '#ff00ff',
          dashed: false
        }
      },
      {
        title: 'Linea Baja Tension Subterranea',
        text: 'Linea Baja Tension Subterranea',
        options: {
          type: 'BT',
          color: '#ff00ff',
          dashed: true
        }
      }
    ]*/
    buttons: {
      "AT":[
        {
          title: 'AT Aérea',
          text: 'AT Aérea',
          options: {
            type: 'AT',
            color: '#FF0000',
            dashed: false
          }
        },
        {
          title: 'AT Subterranea',
          text: 'AT Subterranea',
          options: {
            type: 'AT',
            color: '#FF0000',
            dashed: true
          }
        }],
      "MT":[{
        title: 'MT Aérea',
        text: 'MT Aérea',
        options: {
          type: 'MT',
          color: '#0000ff',
          dashed: false
        }
      },
        {
          title: 'MT Subterranea',
          text: 'MT Subterranea',
          options: {
            type: 'MT',
            color: '#0000ff',
            dashed: true
          }
        }],
      "BT":[{
        title: 'BT Aérea',
        text: 'BT Aérea',
        options: {
          type: 'BT',
          color: '#ff00ff',
          dashed: false
        }
      },
        {
          title: 'BT Subterranea',
          text: 'BT Subterranea',
          options: {
            type: 'BT',
            color: '#ff00ff',
            dashed: true
          }
        }]
    }
  },
  initialize:function(typeLine){
    this._typeLine=typeLine;
  },

  onAdd: function ( map ) {
    var self = this;
    var controlDiv = L.DomUtil.create( 'div', '' );

    this.actions = L.DomUtil.create( 'ul', 'leaflet-actions', controlDiv );

    for ( var i = 0; i < self.options.buttons[this._typeLine].length; i++ ) {
      Util._createButton( {
        title: self.options.buttons[this._typeLine][i].title,
        text: self.options.buttons[this._typeLine][i].text,
        container: L.DomUtil.create( 'li', '', this.actions ),
        options: self.options.buttons[this._typeLine][i].options,
        actions: this.actions,
        callback: this.createLine
      } );
    }

    L.DomEvent
      .addListener( controlDiv, 'click', L.DomEvent.stopPropagation )
      .addListener( controlDiv, 'click', L.DomEvent.preventDefault )
      .addListener( controlDiv, 'click', function () {
        $( Map.getInstance().controls[Map.CTRL_LINE_AT].actions ).hide();
        $( Map.getInstance().controls[Map.CTRL_LINE_MT].actions ).hide();
        $( Map.getInstance().controls[Map.CTRL_LINE_BT].actions ).hide();

        $( Map.getInstance().controls[Map.CTRL_POLYGON].actions ).hide();

        $( self.actions ).fadeToggle( 'fast' );
      } );

    var controlUI = L.DomUtil.create( 'div', 'leaflet-control-custom leaflet-control-line-interior_'+this._typeLine, controlDiv );
    controlUI.title = 'Lineas '+this._typeLine;
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

  /*Map.getInstance().controls[Map.CTRL_LINE].createLine({
    type: classes[0].toUpperCase(),
    color: (classes[0] == 'mt')? '#0000ff': '#ff00ff',
    dashed: classes.length==2
  });*/
});