# RailsAjaxFormhandler

Makes submitting forms remotely via ajax even easier and handles server responded validation errors by adding error-styles and error-messages to each invalid input-field.

![example1](https://raw.githubusercontent.com/brancadavide/rails_ajax_formhandler/master/input_validation_example1.png)



![example2](https://raw.githubusercontent.com/brancadavide/rails_ajax_formhandler/master/input_validation_example2.png)



## Installation

Add this line to your application's Gemfile:

```ruby
gem 'rails_ajax_formhandler'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install rails_ajax_formhandler

In your application.js 

```javascript
//=require ajax_formhandler
```

If you want to use built in validation-styles, add to your application.scss

```css
@import "ajax_formhandler";
```

## Usage

This works with standard generated scaffold controllers, models and views seamlessely!
Just add the following line to your js-file, for example 'client.js':

```javascript
$(document).ready(function{
	
	var form_handler = new FormHandler();
	form_handler.init();

});

```

## Global Options

"new FormHandler()" accepts an option object as only argument:


## HTML

html
an object

```javascript
{
   html:{ 
		wrapperTag: "div", 
		// each input field and label must be wrapped in order to apply the validation-error-markup
		errorClassName: "fh-error-field",
		// default, using the build-in styles
		helpBlockClass: "help-block" 
		// default
	 },...
}
```
or, if you're using Bootstrap Version 3

```javascript
{
	html:	"bootstrap3",...
}
```

## Callbacks

success 	 
a function with the with jqXHR as first, the form-object as second and the event as third argument


```javascript
{ ...
	success:	function(xhr, form, event) {
	// what happens after successive submit
	}
}
```


error  
function with jqXHR as first, the errorThrown(string) as second, the form-object as third and the event as forth argument


```javascript
{ ...
	error:	function(xhr,error, form, event) {
	// any additional actions
	}
}
```

send  
function with the event only argument, will be called on submit


```javascript
{		
	send:	function(event) {
	// any additional actions
	}
}
```

## Controller setup

```ruby
def create
 @client = Client.new(client_params)
 respond_to do |f|
 if @client.save
  f.json { render :show, status: :created}
 else
 	f.json { render json: @client.errors, status: :unprocessable_entity }
 end  
end

def update
 respond_to do |f|
 if @client.update(client_params)
  f.json { render :show, status: :ok}
 else
 	f.json { render json: @client.errors, status: :unprocessable_entity }
 end
  
end

```

## Model

Insert your validations in the model and pass your error-messages like:


```ruby
validates :firstname, presence: { message: "We need your firstname!"}

```

If you're not familiar with, please refer to [guides.rubyonrails](http://guides.rubyonrails.org/active_record_validations.html).



## Development

After checking out the repo, run `bin/setup` to install dependencies. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/brancadavide/rails_ajax_formhandler. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.


## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).

