# -*- coding: utf-8 -*-
class ConsultMailer < ActionMailer::Base


  def send_consult(data)
    @data = data
    email_with_name_to = "Consultas de Snappler Web <info@snappler.com>"
  #  email_with_name_to = "Consultas de Snappler Web <mauro.labattaglia@snappler.com>"
    email_with_name_from = "#{@data['name_surname']} <#{@data['email']}>"

    mail(to: email_with_name_to, :from => email_with_name_from, :reply_to => @data['email'], subject: 'Consultas de Snappler Web') do |format|
      format.html {render 'send_consult'}
    end
  end


#------------------------------------------------------------------------------------------------------------
#------------------------------------------------------------------------------------------------------------
#------------------------------------------------------------------------------------------------------------

 
  end

