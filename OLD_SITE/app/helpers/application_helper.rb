module ApplicationHelper


  #Helper pa dibujar la funcion de javascript q lanza una alerta dinamica
  def set_flash_msg
    html = '';
    flash.each do |name, msg|
      if msg.is_a?(String)
        name = (name == 'notice')? "success" : "danger"
        html += "set_flash_msg('#{msg}','#{name}');"
      end
    end
    flash.clear
    return html.html_safe
  end


end
