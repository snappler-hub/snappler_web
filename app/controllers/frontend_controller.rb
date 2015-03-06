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

	

end