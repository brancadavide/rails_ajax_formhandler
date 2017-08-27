# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rails_ajax_formhandler/version'

Gem::Specification.new do |spec|
  spec.name          = "rails_ajax_formhandler"
  spec.version       = RailsAjaxFormhandler::VERSION
  spec.authors       = ["Davide Brancaccio"]
  spec.email         = ["info@yield-in.de"]

  spec.summary       = %q{Handling form submissions via ajax and rendering validation-errors automatically}
  spec.description   = %q{RailsAjaxFormhandler is a lightweight Javascript-plugin wich submits your form automatically and displays server responded validation-errors by adding styles and error-messages to the invalid input fields. }
  spec.homepage      = "https://github.com/brancadavide/rails_ajax_formhandler"
  spec.license       = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.


  spec.files         = `git ls-files -z`.split("\x0").reject do |f|
    f.match(%r{^(test|spec|features)/})
  end
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.14"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency 'sprockets-rails', '>= 2.1.3'
  spec.add_development_dependency 'jquery-rails', '>= 3.1.0'

end
