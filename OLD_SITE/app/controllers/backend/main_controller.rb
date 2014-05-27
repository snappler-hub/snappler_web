class Backend::MainController < ApplicationController
	layout 'backend_default'
	before_action :authenticate_user!

	#-----------------------------------------------------------------------------------
	#-----------------------------------------------------------------------------------
	def index
		@menu_active = 'backend'
	end



end

