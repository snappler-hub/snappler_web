module ApplicationHelper

  def flash_message(klass, message)
    klass = 'success' if klass == 'notice' || klass == 'alert'
    flash.discard(klass)
    content_tag :article, class: "alert alert-#{klass}" do
      concat close_button(:alert)
      concat message
    end
  end

  def flash_messages
    flash.map do |type, message|
      flash_message(type, message)
    end.join.html_safe
  end

  def close_button(target = :modal)
    link_to '&times;'.html_safe, '', class: :close, data: {dismiss: target}
  end

  def icon(name, html_options={})
    html_options[:class] = ['fa', "fa-#{name}", html_options[:class]].compact
    content_tag(:i, nil, html_options)
  end

  def icon_left(name, string)
    (content_tag(:i, nil, class: "fa fa-#{name} margin-right-5") + string)
  end

  def icon_right(name, string)
   (string + content_tag(:i, nil, class: "fa fa-#{name} margin-left-5")).html_safe
 end

end