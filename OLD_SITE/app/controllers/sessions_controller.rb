class SessionsController < Devise::SessionsController

	layout 'backend_default'
	before_filter :set_menu_activa
	


	private
	
	def set_menu_activa
		@menu_active = 'backend'
	end

end