# -*- coding: utf-8 -*-
class FrontendController < ApplicationController





	#-----------------------------------------------------------------------------------
	def send_consult

      if(! params[:name_surname].blank?) && (! params[:email].blank?) && (! params[:comments].blank?)
        @status = true

        ConsultMailer.send_consult(params).deliver
        flash.clear
        flash[:notice] = 'Mensaje Enviado'
      else
        @status = false
        flash.clear
        flash[:error] = 'Completar Campos'
      end

      respond_to do |format|
        format.js
      end
	end

  #-----------------------------------------------------------------------------------
  def get_product
    @product = {}
    case params[:id].to_i
    when 1
      #teytu
      @product[:img] = 'product-teytu.png'
      @product[:name] = 'Tecnología de Turismo'
    when 2
      #gestion
      @product[:img] = 'product-gestion.png'
      @product[:name] = 'Gestión de Empresas'
    when 3
      #torneos
      @product[:img] = 'product-torneos.png'
      @product[:name] = 'Gestión para Torneos'
    end
  end

  #-----------------------------------------------------------------------------------
  def get_work
    @work = {}
    case params[:id].to_i
    when 1
      @work[:name] = 'Aero'
      @work[:img] = 'aero.png'
      @work[:kind] = 'Sistema'
      @work[:text] = '<p>Aero es uno de los principales operadores de turismo de Argentina.</p>
       <p>Desarrollamos una aplicación para la gestión de reservas de aéreos y paquetes turísticos. La misma resuelve toda la operatorio de la organización a la vez que se encarga de la integración con sistemas preexistentes.</p>'
    when 2
      @work[:name] = 'Ministerio de Economia PBA'
      @work[:img] = 'min.png'
      @work[:kind] = 'Web Mobile'
      @work[:text] = '<p>Fuimos el equipo a cargo de la adaptación de la web del Ministerio de Economía de la provincia de Buenos Aires.</p>
       <p>El trabajo se baso en el análisis, diagramación, maquetación e implementación del nuevo sitio mobile.</p>'
    when 3
      @work[:name] = 'Infoauto'
      @work[:img] = 'infoauto.png'
      @work[:kind] = 'Web + Sistema'
      @work[:text] = '<p>Infoauto es la página de consulta de rodados más visitada de Argentina, considerada en el rubro como la guía oficial de precios.</p>
       <p>Implementamos la nueva web y su versión mobile junto con un backend que satisface todos los requisitos para la auto-gestión de la misma.</p>'
    when 4
      @work[:name] = 'La Piedad'
      @work[:img] = 'lapiedad.png'
      @work[:kind] = 'Sistema'
      @work[:text] = '<p>Es una de las panaderías con mayor prestigio y tradición de la ciudad de La Plata.</p>
       <p>Desarrollamos e implementamos un sistema de gestión y puestos de venta con terminales touch screen para la gestión de la panadería.</p>'
    when 5
      @work[:name] = 'Proyecciones Digitales'
      @work[:img] = 'proyecciones.png'
      @work[:kind] = 'Web + Sistema'
      @work[:text] = '<p>Proyecciones Digitales es una de las empresas de mayor trayectoria brindando soluciones audiovisuales del país.</p>
       <p>Implementamos su nuevo sitio web institucional con el correspondiente backend que cubre todos las necesidades para la auto-gestión del mismo.</p>'
    end
  end

end




