

/*
Form-Handler by Davide Brancaccio


FormHandler submits your form automatically via ajax and handles validation-rendering also by adding error-styles and messages.
This works without any additional setup with standard-rails scaffold forms and controllers, just by adding validations to the model.

Example scaffold 'Client':

	client.rb:

				....
				validates :firstname, presence: { message: "Can't be blank!"}
				validates :firstname, uniqueness: { scope: [:lastname,:phone], message: "Already exists!"}
				...

	clients_controller.rb:

				....
				if @client.save
				...
				format.json { render :show, status: :created }
				...
				else
				...
				format.json { render json: @client.errors, status: :unprocessable_entity}

				...

	show.json.jbuilder

					...
					json.extract! @client, :id,:firstname,:lastname,...

				<or if namespacing is required>

					json.set! :client do |client|
							client.extract! @client, :id,:firstname,:lastname,...
					end
					....

	_form.html.erb

				...
				<div class="field">
						<%= f.label :firstname, "Firstname" %><br/>
						<%= f.text_field :firstname %>
				</div>

	In your client.js just add:

				$(document).ready(function(){
					
					var form_handler = new FormHandler();
					form_handler.init();

				});


	That's it! Now the form will be submited via ajax and will display validation errors for each given field.

	On success the form will just be reseted. Please note that for each input/label there must be a wrapper like '<div class="field">...</div>' 
	like in the example above in order to work!


	There are following options:
		
		'html':  use your own styling instead of the provided defaults:
		---------------------------------------------------------------			

					html: 	{		wrapperTag:  default is 'div',
											errorClass:  class applied to the wrapper, default is 'error-field',
											helpBlockClass: provides error-message/s styling, default is "help-block"
									}
		or if you're using bootstrap v3, it's just

					html: 	"bootstrap3" 

		'success':  callback after (ajax)-success, accepts a function with jqXHR as first, the form-object as second and the event as third argument:
		---------------------------------------------------------------------------------------------------------------------------------------------

					success: function(xhr, form, event) {
							
					}

		'error': callback  after(ajax)-error, accepts a function with jqXHR as first, the errorThrown(string) as second, the form-object as third and the event as forth argument:
		--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
					
					error: function( xhr, error, form, event) {
	
					}

		'send': callback when the form will be submitted, accepts a function with the event as only argument:
		-----------------------------------------------------------------------------------------------------
				
					send: function(event) {
	
					}

	as example:
	----------
							var form_handler = new FormHandler({
										html: {
												errorClass: "my-error-class",
												helpBlockClass: "error-feedback"
										},
										success: function(xhr, form, event) {
											var response = xhr.responseJSON;
											$(form)....
										}
							})

							form_handler.init();
	
	--------------------------------------------------------------------------------------------------------------

	Multiple Form Support
	----------------------

	If you use more than one form on one page, FormHandler detects it automatically and applies given options to all forms.
	So your settings become global. To specify the options for every single form just use the 'config_form()' method and provide
	the form-name, for eexample "client" and the specified options like

			form_handler.config_form('client', {
					success: function(xhr, form, event) {
							...do anything else
					}
			})
	
	if, for some reasons, you don't want to FormHandler to take care of one or some forms, just pass ' ignore: true':

			form_handler.config_form('client', {
					ignore: true
					}
			});


	Redirections
	-------------

	In some cases, the shown input field is not actually the field meant to be submitted, instead the value is stored in an hidden input.
	For example when you use datepicker or typeahead.

	Because FormHandler takes advantage of rails-naming-convention, it is looking for the hidden input-field. 
	To work properly, the hidden-input musst be of course inside a wrapper and must appear after the 'dummy-input'.

	But if you try to edit the record, the existing value doesn't show up either, if you haven't done any workarounds.


	To make sure that the validation-rendering works reliable and the value is shown also on your edit-form, use the 
	'apply_validation_to()' method. 

	Example
	-------

	_form.html.erb
					....
					<input type="text" id="date_show" class="any-datepicker">
					<%= f.hidden_field :date_of_birth %>
					....

	client.js 
						var form_handler = new FormHandler({
										html: {
												errorClass: "my-error-class",
												helpBlockClass: "error-feedback"
										},
										success: function(xhr, form, event) {
											var response = xhr.responseJSON;
											$(form)....
										}
							});

							form_handler.apply_validation_to("client",{
								"client_date_of_birth": "date_show"
							})

							form_handler.init();

or even easier with data-attribute:
		

		_form.html.erb
					....
					<input type="text" id="date_show" class="any-datepicker">
					<%= f.hidden_field :date_of_birth, data: {validation: "date_show"} %>
					....


PLEASE NOTE THAT VALIDATION-RENDERING NOT WORKING WITH NESTED ATTRIBUTES, AT LEAST NOT WITHOUT ANY WORKAROUNDS!

*/

	

	var FormHandler = function(options) {
		var options = options || {};
		this.global_defaults = {
			html: {}
		} 
		$.extend(true, this.global_defaults, options);
		this.form_objects = this.auto_detect();
	}


	FormHandler.prototype.filter_form_name = function(form_id) {
		var form_name,form_name_parts = form_id.replace(/(new_|edit_|form_)/g, '').split('_');
		var last_part = form_name_parts[form_name_parts.length -1]
		if(isNaN(parseInt(last_part))){
			form_name = form_name_parts.join("_")
		} else {
			form_name = form_name_parts.slice(0, form_name_parts.length -1).join("_");
		}
		return form_name
	}

	FormHandler.prototype.config_form = function(form,options) {
		var options = options || {};
		this.form_objects[form] = $.extend(true,this.form_objects[form], options);
	};

	FormHandler.config_form_element = function(form, options) {
		var form_name = this.filter_form_name($(form).attr('id'));
		return this.config_form(form_name, options);
	}

	FormHandler.prototype.auto_detect = function() {
		var form_objects = {};
		var form_handler = this;
		var global_defaults = this.global_defaults;
		var count = 0;
		$.each($('form'),function(index,form) {			
			if(form.id) {	
			var form_name = form_handler.filter_form_name(form.id);
			var form_object = {	id: form.id, ignore: false, name: form_name};
					$.extend(true,form_object,global_defaults);
					form_objects[form_name] = form_object;
			}
			else {
				console.error("Missing id on this form: the id must start with \"form_\" and end with the underscored modelname. Example: modelname is \"ClientHistory\" so the id must be \"form_client_history\". ")
				return false;
			}

		})
		return form_objects;
	};


	FormHandler.prototype.init = function() {
		if(this.form_objects) {	
			var instances = {};
			$.each(this.form_objects, function(name, settings) {
			
			if(!settings.ignore) {
				instances[name] = new FormObject(settings.id, settings);
				instances[name].set_listener()	
			}
			})
			this.instances = instances;
		} else {
			return false
		}
	
	};

	

	FormHandler.prototype.apply_validation_to = function(form_object_name,settings) {
		var settings = settings || {};
		this.instances[form_object_name].set_redirections(settings);
	};

	var ValidationRenderer = function(form_object,html_settings) {
		
		this.form_object = form_object;
		this.html_defaults = {
			wrapperTag: 'div',
			errorClass: "fh-error-field",
			helpBlockClass: 'help-block'
		}

		this.bootstrap3_defaults = {
			wrapperTag: 'div',
			errorClass: "has-error",
			helpBlockClass: "help-block"
		}

		if(typeof html_settings === "string" && html_settings === "bootstrap3") {

			this.html_settings = this.bootstrap3_defaults;
		} else if ( typeof html_settings === 'object') {
			this.html_settings = $.extend(this.html_defaults, html_settings)
		} else {
			this.html_settings = this.html_defaults;
		}

	}

	ValidationRenderer.prototype.message_tag = function(content) {
		var open = "<span class='" +  this.html_settings.helpBlockClass + "' >";
		var close = "</span>\n";
		return(open + content + close);

	};

	ValidationRenderer.prototype.render_messages = function(messages) {
			var error_messages = "";
			var that = this;
			
				$.each(messages, function(index, message) {
					error_messages += that.message_tag(message);
			
			})
		return error_messages;
	};

	ValidationRenderer.prototype.add_error = function(field, errors) {
		var wrapper = field.closest(this.html_settings.wrapperTag);
				wrapper
					.toggleClass(this.html_settings.errorClass,true)
					.append(this.render_messages(errors));
	};

	ValidationRenderer.prototype.remove_error = function(field) {
		var wrapper = field.closest(this.html_settings.wrapperTag);
				wrapper
					.toggleClass(this.html_settings.errorClass,false)
					.find("." + this.html_settings.helpBlockClass).remove();
	};

	ValidationRenderer.prototype.render = function(fields, errors) {
		var prefix = this.form_object + "_";
		var validation_renderer = this;
		$.each( fields, function(key,field) {
			var field_id = $("#" + key).attr('id');
			var field_name = field_id.replace(prefix, '');
					validation_renderer.remove_error($("#" + field));
					if(errors[field_name]) {
							validation_renderer.add_error($("#" + field), errors[field_name])
					}
		})
	};


var FormObject = function(form_id, options) {
	
	this.callbacks = {};
	this.callbacks.on_success = options.success || function() {};
	this.callbacks.before_submit = options.send || function() {};
	this.callbacks.on_error = options.error || function() {};
	this.form_id = form_id;
	this.form = $("#" + form_id);
	this.form_object_name = options.name;
	this.method = "POST";
	this.set_form_type();
	this.html_options = options.html;
	this.redirections = {};
	this.set_redirections();
	this.validation_renderer = new ValidationRenderer(this.form_object_name,this.html_options);
	
	
}
FormObject.prototype.set_form_type = function() {
	var form = $("#" + this.form_id);
	if(form.find("input[name='_method']").length > 0) {
		this.method = form.find("input[name='_method']").first().val();
	}
	
};



FormObject.prototype.get_ajax_settings = function(event,values) {
	var form_object = this;
	var values = values;
	var event = event;
	var ajax_settings = {
												method: form_object.method,
												url: this.form.attr('action'),
												dataType: "JSON",
												data: values,
												error: function(xhr, status, error) {
													form_object.callbacks.on_error(xhr, error,form_object.form,event);
													form_object.error(xhr.responseJSON)
												},
												success: function(object, status,xhr) {
													form_object.callbacks.on_success(xhr,form_object.form,event)
													form_object.success(xhr.responseJSON)
												}
											}

		return ajax_settings;
	};

	

	FormObject.prototype.set_listener = function() {
		var form_object = this;
		this.form.on('submit', function(event) {
			event.preventDefault();
			event.stopPropagation();
			var ajax_settings = form_object.get_ajax_settings( event, $(this).serialize()  );
			form_object.callbacks.before_submit(event);
				$.ajax(ajax_settings)
		})
	};


	FormObject.prototype.set_redirections = function(redirections) {
		var redirections = redirections || {};
		var detected = {};
		this.form.find('input, select, textarea').each(function(index, field) {
			if($(field).attr('data-validation')) {
				var field_id = $(field).attr('id');
				detected[field_id] = $(field).attr('data-validation');
				if( !$(detected[field_id]).val() ) {
						var original_value = $(field).val();
						$("#" + detected[field_id]).val(original_value);
				}
			}
		});
		this.redirections = $.extend(detected,redirections);
	};

	FormObject.prototype.get_redirections = function() {
		return this.redirections;
	}

	FormObject.prototype.get_html_options = function() {
		return this.html_options;
	};

	FormObject.prototype.set_html_options = function(html_options) {
		this.html_options = html_options;
		
	};

	FormObject.prototype.fields = function() {
		var redirections = this.get_redirections();
		var fields = {};
		var blacklist = {};
		this.form.find('input, select, textarea').each(function(index, field) {
			
			var field_id = $(field).attr('id');
			

			if(field_id != undefined) {
					if(redirections[field_id]) { 
						 fields[field_id] = redirections[field_id];
						 blacklist[redirections[field_id]] = true;  
					 } else {				
					  blacklist[field_id] ? null : fields[field_id] = field_id;
					 }
			}
		})
		return fields;
	};

	FormObject.prototype.error = function(response_object) {
		var errors;
		console.log(response_object);
		response_object[this.form_object] === undefined ? errors = response_object : errors = response_object[this.form_object]
		this.validation_renderer.render(this.fields(),errors);

	};
	
	FormObject.prototype.success = function() {
		var form_object = this;
		var fields = this.fields();
		$.each(fields,function(key,value) {
			var field = $("#" + value); 
			form_object.validation_renderer.remove_error(field);
		})
	};

	
	FormObject.prototype.set_callbacks = function(callback, func) {
	  this.callbacks[callback] = func();
	};

	FormObject.prototype.set_html_options = function(html_options) {
	  this.html_options = $.extend(this.html_options, html_options);
	};



	



















