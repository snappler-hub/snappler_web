class Public::StaticPagesController < ApplicationController
	layout 'frontend_default'

	def index
		render :layout => 'frontend_index'
	end

	def about
	end

	def contact
	end
end

