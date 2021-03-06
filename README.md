# RailsAjaxFormhandler

Submits forms remotely with ajax automatically and handles server responded validation errors by adding error-styles and error-messages to each invalid input-field.

![example1](https://raw.githubusercontent.com/brancadavide/rails_ajax_formhandler/master/input_validation_example1.png)



![example2](https://raw.githubusercontent.com/brancadavide/rails_ajax_formhandler/master/input_validation_example2.png)



## Installation

Add this line to your application's Gemfile:

```ruby
gem 'rails_ajax_formhandler'
```

And then execute:

    $ bundle install

Or install it yourself as:

    $ gem install rails_ajax_formhandler

In your application.js 

if not already done:

```js
//=require jquery
```

after that:

```js
//=require ajax_formhandler
```

If you want to use built in validation-styles, add to your application.scss

```css
@import "ajax_formhandler";
```

## Usage

#Important
This works 'out of the box' with 'form_for'. Since Rails 5.1 the new 'form_with' is standard and 'form_for' will be removed completely removed in future releases. Until than,
the ajax_formhandler works with 'form_with' only with a little workaround, see below under "form_with". As soon as 'form_for' is completely removed, we'll come up with a new version, written explicitly for 'form_with'!

This works with standard generated scaffold controllers, models and views seamlessely!
Just add the following line to your js-file, for example 'client.js':

```js
$(document).ready(function() {
 
  var form_handler = new FormHandler();
  form_handler.init();

});

```
I'll automatically detects your form and set an event-listener, so the form will be submitted with ajax.

__Please note that in order to work, use the "form_for"-helper in your view as usual!__

## Global Options

"new FormHandler()" accepts an option object as only argument:


## HTML

### html
 accepts an object with the keys shown below

```js
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

```js
{
  html:	"bootstrap3",...
}
```


## Callbacks

all callbacks accepting only a function	

### success 	 

jqXHR as first, the form-object as second and the event as third argument


```js
{ ...
  success: function(xhr, form, event) {
  // what happens after success
  }
}
```


### error  
jqXHR as first, the errorThrown(string) as second, the form-object as third and the event as forth argument


```js
{ ...
  error: function(xhr,error, form, event) {
  // any additional actions
  }
}
```

### send  
event as only argument, will be called on submit


```js
{ 
  send: function(event) {
  // any additional actions
 }
}
```

### *Example:*


```js
{ html: {
  wrapperTag: "div",
  errorClass: "my-error-class",
  helpBlockClass: "my-help-block"
 },
 success: function(xhr, form, event) {
  $("#success-message").html("Form successfully submitted");
  form[0].reset();
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

_Note_ that the json response in case of error works only if the json-string contains only the errors-object, or, if namespacing is required, the object name as key and the errors as values.

```ruby 
  f.json { render json: @client.errors, status: :unprocessable_entity }

```
or

```ruby 
  f.json { render json: { client: @client.errors, data: "some other stuff"}, status: :unprocessable_entity }

```
That gives you the possibility, passing some other informations alongside the errors-object, if required.

## Model

Insert your validations in the model and pass your error-messages like:


```ruby 
 validates :firstname, presence: { message: "We need your firstname!"}
```

More about rails validations: [http://guides.rubyonrails.org](http://guides.rubyonrails.org/active_record_validations.html).


## Multiple Forms

If you have two or more forms on one page, FormHandler detects them all and sets them up. The passed arguments will be applied to each form. For specific configuration, call the ".config_form()"
method:

 ```js
 
 var form_handler = new FormHandler({ html: "bootstrap3"})

 // first argument is the modelname
 // do this before you call ".init()"
 form_handler.config_form("client",{
 	success: function(xhr,form, event ) {
 	 // do something special....
 	}
 })

 form_handler.init();
 ```
## Hidden fields

In some cases the input-field shown in the form doesn't store the actual value, but updates a hidden_field, which will be submitted.For example, a datepicker:

![datepicker](https://raw.githubusercontent.com/brancadavide/rails_ajax_formhandler/master/input_datepicker.png)

would look like


```ruby
...
<div class="field">
<input type="text" class="datepicker" id="datepicker-input">

<%= f.hidden_field :date_of_birth %>
</div>
```

In this case please make sure that the hidden-input appears _after_ the 'dummy-field', like in the example above in order to render validation errors properly!

# Using with "form_with"

## in *_form.html.erb* 

Adding an id , starting with "form_", ending with the modelname to the "form_with"- tag.
"form_with" doesn't add an id automatically, so you need to add an id in the same fashion:
`<modelname>_<fieldname>`


```ruby
...
<%=form_with model: costumer_bill, id: "form_costumer_bill" do |form|%>
   .... 
    <%= form.text_field :name, id: "costumer_bill_name" %>
  ...
<% end %>
```



## Contributing and Support

Bug reports and pull requests are welcome on GitHub at https://github.com/brancadavide/rails_ajax_formhandler. 
For support just contact me [info@yield-in.de](mailto:info@yield-in.de)

## Credits

Author: Davide Brancaccio

You're welcome to join the contributors-list!

## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).

