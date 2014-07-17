/**
 * Created by snappler on 05/06/14.
 */
/**
 * Created by snappler on 14/03/14.
 */
SidebarControl = L.Control.extend( {
  options: {
    position: 'bottomright'
  },

  onAdd: function ( map ) {
    var controlDiv = L.DomUtil.create( 'div', '' );
    var nextStatus='hide',
        currentStatus='show',
        self=this;
    this.sidebarSelector="";
    this.isDisplayable=true;

    L.DomEvent
      .addListener( controlDiv, 'click', L.DomEvent.stopPropagation )
      .addListener( controlDiv, 'click', L.DomEvent.preventDefault )
      .addListener( controlDiv, 'click', function () {
        if(self.isDisplayable){
          nextStatus='show';
          currentStatus='hide';
          self.hide();
        }
        else {
          nextStatus='hide';
          currentStatus='show';
        }

        self.isDisplayable=!self.isDisplayable;

        $(controlDiv).find('.leaflet-control-sidebar-'+currentStatus+'-interior' ).removeClass('leaflet-control-sidebar-'+currentStatus+'-interior')
          .addClass('leaflet-control-sidebar-'+nextStatus+'-interior');
      } );

    var controlUI = L.DomUtil.create( 'div', 'leaflet-control-custom leaflet-control-sidebar leaflet-control-sidebar-'+nextStatus+'-interior', controlDiv );
    controlUI.title = 'Lineas';
    return controlDiv;
  },
  show:function(){
    if(this.isDisplayable){
      $(this.sidebarSelector ).show(0);
      Map.getInstance().controls[Map.CTRL_SIDEBAR].show();
    }
  },
  hide:function(){
    Map.getInstance().controls[Map.CTRL_SIDEBAR].hide();
    $(this.sidebarSelector ).hide(0);
  }
} );