class Frontend::MainController < ApplicationController
	layout 'frontend_default'

	#-----------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------
	def index
	end

	#-----------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------
	def about
		@menu_active = 'about'
	end

	#-----------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------
	def how
		@menu_active = 'how'
	end

	#-----------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------
	def who
		@menu_active = 'who'
	end

	#-----------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------
	def contact
		@menu_active = 'contact'
	end



	#-----------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------
	def send_consult


      if(! params[:express_contact][:name_surname].blank?) && (! params[:express_contact][:email].blank?) && (! params[:express_contact][:comments].blank?)
        @status = true

        ConsultMailer.send_consult(params[:express_contact]).deliver
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

