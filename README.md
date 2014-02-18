JQueryPlugin
============

Contains plugins added in JQuery by me.

validate.js
========
Include the js any where between the place the Jquery is included and the plugin is invoked. 
the controls that need to be validated should have the following attribute.

caption="<any meaningful name that need to be displayed>"
validate-FormGroup="validation-options"

lets each of them in details
Caption : is the name that will be displayed in message.
The controls to validate has to be classified in forms for which we want the validation to be triggered. We pass categorize this by replacing the FormGroup part of the attribute name "validate-FormGroup"
