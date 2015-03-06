class RegistrationsController < Devise::RegistrationsController

	skip_before_filter :set_breadcrumbs

  def new
    redirect_to :backend
  end

  protected

  def after_update_path_for(resource)
    backend_path
  end

  
  
end