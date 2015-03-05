module Destroyable

  extend ActiveSupport::Concern

  included do
    def destroyable?
      true
    end

    def destroy
      super if destroyable?
    end
  end

end