inputs = %w[
  CollectionSelectInput
  DateTimeInput
  FileInput
  GroupedCollectionSelectInput
  NumericInput
  PasswordInput
  RangeInput
  StringInput
  TextInput
]

inputs.each do |input_type|
  superclass = "SimpleForm::Inputs::#{input_type}".constantize

  new_class = Class.new(superclass) do
    def input_html_classes
      super.push('form-control')
    end
  end

  Object.const_set(input_type, new_class)
end

# Use this setup block to configure all options available in SimpleForm.
SimpleForm.setup do |config|
  config.boolean_style = :nested


  # Default - Vertical Wrapper
  config.wrappers :bootstrap3, tag: 'div', class: 'form-group', error_class: 'has-error',
                  defaults: {input_html: {class: 'default_class'}} do |b|
    b.use :html5
    b.use :min_max
    b.use :maxlength
    b.use :placeholder

    b.optional :pattern
    b.optional :readonly

    b.use :label_input
    b.use :hint, wrap_with: {tag: 'span', class: 'help-block'}
    b.use :error, wrap_with: {tag: 'span', class: 'help-block has-error'}
  end


  # Horizontal Wrapper
  config.wrappers :bootstrap3_horizontal, tag: 'div', class: 'form-group', error_class: 'has-error',
                  defaults: {input_html: {class: 'form-group default_class'}} do |b|
    b.use :html5
    b.use :min_max
    b.use :maxlength
    b.use :placeholder

    b.optional :pattern
    b.optional :readonly

    # b.use :label, :class: 'miClase' -> ESTO NO FUNCA (poner una clase a un label)
    b.use :label, wrap_with: {tag: :span, class: 'col-sm-3'}

    b.wrapper tag: 'div', class: 'col-sm-9' do |input_block|
      input_block.use :input
      input_block.use :hint, wrap_with: {tag: 'span', class: 'help-block'}
    end
    b.use :error, wrap_with: {tag: 'span', class: 'help-block has-error'}
  end


  config.wrappers :prepend, tag: 'div', class: 'form-group', error_class: 'has-error' do |b|
    b.use :html5
    b.use :placeholder
    b.wrapper tag: 'div', class: 'controls' do |input|
      input.wrapper tag: 'div', class: 'input-group' do |prepend|
        prepend.use :label, class: 'input-group-addon' ###Please note setting class here fro the label does not currently work (let me know if you know a workaround as this is the final hurdle)
        prepend.use :input
      end
      input.use :hint, wrap_with: {tag: 'span', class: 'help-block'}
      input.use :error, wrap_with: {tag: 'span', class: 'help-block has-error'}
    end
  end

  config.wrappers :append, tag: 'div', class: 'form-group', error_class: 'has-error' do |b|
    b.use :html5
    b.use :placeholder
    b.wrapper tag: 'div', class: 'controls' do |input|
      input.wrapper tag: 'div', class: 'input-group' do |prepend|
        prepend.use :input
        prepend.use :label, class: 'input-group-addon' ###Please note setting class here fro the label does not currently work (let me know if you know a workaround as this is the final hurdle)
      end
      input.use :hint, wrap_with: {tag: 'span', class: 'help-block'}
      input.use :error, wrap_with: {tag: 'span', class: 'help-block has-error'}
    end
  end

  config.wrappers :checkbox, tag: :div, class: "checkbox", error_class: "has-error" do |b|

    # Form extensions
    b.use :html5

    # Form components
    b.wrapper tag: :label do |ba|
      ba.use :input
      ba.use :label_text
    end

    b.use :hint, wrap_with: {tag: :p, class: "help-block"}
    b.use :error, wrap_with: {tag: :span, class: "help-block text-danger"}
  end

  config.button_class = 'btn btn-default'
  config.default_wrapper = :bootstrap3
end