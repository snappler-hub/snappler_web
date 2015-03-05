$(function(){
    $(window).scroll(function(){
        if ($(this).scrollTop() > 50){
            $('.navbar-default').addClass('navbar-shrink');
        }
        else{
            $('.navbar-default').removeClass('navbar-shrink');
        }
    });
});