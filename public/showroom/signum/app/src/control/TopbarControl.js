/**
 * Created by snappler on 05/06/14.
 */
/**
 * Created by snappler on 14/03/14.
 */
TopbarControl = L.Control.extend( {
  options: {
    position: 'topright'
  },

  onAdd: function ( map ) {
    var self = this;
    this.controlDiv = L.DomUtil.create( 'div', 'leaflet-control-topbar ' );

    L.DomEvent
      .addListener( this.controlDiv, 'click', L.DomEvent.stopPropagation )
      .addListener( this.controlDiv, 'click', L.DomEvent.preventDefault )
      .addListener( this.controlDiv, 'click', function () {
/*        $('#ver-minimalist').fadeToggle(0);
        $('#map' ).css('top', $('.navbar' ).css('height'));*/

        if($('.navbar' ).css('height')=='0px') self.show();
        else self.hide();
      } );

    var controlUI = L.DomUtil.create( 'div', 'leaflet-control-custom leaflet-control-topbar-hide-interior', this.controlDiv );
    controlUI.title = 'Lineas';
    return this.controlDiv;
  },
  show:function(){
    $('#ver-minimalist').show(0);
    $('#map' ).css('top', $('.navbar' ).css('height'));

    $(this.controlDiv).find('.leaflet-control-custom' )
      .removeClass('leaflet-control-topbar-show-interior')
      .addClass('leaflet-control-topbar-hide-interior');
  },
  hide:function(){
    $('#ver-minimalist').hide(0);
    $('#map' ).css('top', $('.navbar' ).css('height'));

    $(this.controlDiv).find('.leaflet-control-custom' )
      .removeClass('leaflet-control-topbar-hide-interior')
      .addClass('leaflet-control-topbar-show-interior');
  }
} );