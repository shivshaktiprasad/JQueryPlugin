JQueryPlugin
============

Contains custom plugins created in JQuery by me.

validate.js
========
Include the js any where after the place the Jquery is included and after the plugin is invoked. 
the controls that need to be validated should have the following attribute.

caption="<any meaningful name that need to be displayed>"
validate="validation-options"

lets see each of them in details
Caption : is the name that will be displayed in message.
validate : its value contains a list of comma seperated key : value pair options that is equivalent to a JSON object when grouped together. It can have the following options:

1. required : true.

2. minLength : an integer.

3. maxLength : an integer.

4. allow : [ an array of values (usefull in dropdown list)].

5. notAllow : [ an array of values].

6. type : if this specified with a string of predefined list of values (that is mentioned below), then a specific type of validation is performed apart from the above mentined list. Lets say if a 'number' as type is specified along with required, minLength, then all three types of validation is applied and a custom message is shown. The predefined types are 'number', 'email', 'alphanumeric', 'url', 'regexp' or a custom fuction name.

7. errMessage : custom error message to be displayed of validation voilation. A default message is dislayed if this is skipped which is specific to the kind of voilation.

The type option can also be specified as an another JSON object which can have a list of options as below:

1. value : the name of type i.e. 'number', 'email'.. etc

2. allowContent : [ an array of any additional strings that need to be allowed.]

3. errMessage: custom error message to be displayed only on type voilation.

4. expr : a regular expression to be used only with type.value : 'regexp'.


This module is still under development and enhancement phase we should try not to change the basics approach mentioned above.
