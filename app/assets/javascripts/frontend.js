// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require frontend/jquery
//= require jquery_ujs
//= require frontend/bootstrap
//= require frontend/jqueryEasing
//= require frontend/classie
//= require frontend/cbpAnimatedHeader
//= require frontend/jqBootstrapValidation
//= require frontend/contact_me
//= require frontend/agency




$(document).ready(function(){
	resize_divs();
	set_menu_class();

	window.onresize = function(event){
		resize_divs();
	}


	$(document).on('click', '.navbar-default .nav li', function(){
		var lis = $('.navbar-default .nav li');
		lis.remove($(this));
		lis.removeClass('active')
		$(this).addClass('active');
	});




});



function set_menu_class(){
	if ( window.pageYOffset >= 50 ) {
		$('.navbar-default').addClass('navbar-shrink' );
	}
	else {
		$('.navbar-default').removeClass('navbar-shrink' );
	}
}

function resize_divs() {
	vpw = $(window).width();
	vph = $(window).height();
	$('.to_resize').css({'height': vph + 'px'});
}