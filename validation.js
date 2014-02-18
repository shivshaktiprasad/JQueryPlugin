﻿(function ($) {
    $.validate = function (validateFor) {
        var output = { isValid: true, message: "", results: [] };
        if (validateFor) {
            $("[validate-" + validateFor + "]").each(function () {
                var options = $(this).attr("validate-" + validateFor);
                if (options) {
                    options = eval('options={' + options + '}');
                    $.extend(options, { value: $(this).val() });
                    var res = Validation.validate(options);
                    $.extend(res, { control: this });
                    if (!res.isValid) {
                        var caption = $(this).attr("caption");
                        if (caption) {
                            res.message = caption + " is " + res.message;
                        }
                        output.isValid = false;
                        output.message += "\n" + res.message;
                        if (options.overlayMessage) {
                            OverlayMessage(res.control, res.message);
                        }
                    }
                    $(output.results).append(res);
                }
            });
        }
        return output;
    };
}(jQuery));
function OverlayMessage(control, message) {
    $(control).after($(document.createElement("div")).attr("id", "abcd").css({ "background-color": "red", "position": "relative", "height": $(control).height(), "width": $(control).width() }));
}

Validation = {
    ValidationResult: function (IsValid, Message) {
        this.isValid = true;
        this.message = "";
        this.control = null;
        if ('undefined' != typeof IsValid) {
            if ('boolean' == typeof IsValid) {
                this.isValid = IsValid;
                this.message = Message ? Message : "";
            }
            else {
                $.extend(this, IsValid);
            }
        }
    },
    validate: function (options) {
        var isEmpty = false;
        //validate for mandatory
        if (options.mandatory) {
            if (options.value == undefined)
                return new this.ValidationResult(false, "mandatory");
            if ('object' == typeof options.value)
                return new this.ValidationResult(false, "mandatory");
            if ('string' == typeof options.value && options.value == "")
                return new this.ValidationResult(false, "mandatory");
        }else{
            if (options.value == undefined)
                isEmpty = true;
            if ('object' == typeof options.value)
                isEmpty = true;
            if ('string' == typeof options.value && options.value == "")
                isEmpty = true;
        }
        var allowedChars = false;
        if (options.allowedChar) {
            if ('string' === typeof options.allowedChar) {
                allowedChars = true;
            }
        }

        //validate for number
        if (options.number) {
            if (isNaN(parseFloat(options.value)) && !isFinite(options.value)) {
                return new this.ValidationResult(false, "not a number");
            }
        }

        //validate for minimum length of string
        if (options.minLength) {
            if (options.value.length < options.minLength) {
                return new this.ValidationResult(false, "less than minimum length");
            }
        }

        //validate for maximum length of string
        if (options.maxLength) {
            if (options.value.length > options.maxLength) {
                return new this.ValidationResult(false, "greater than maximum length");
            }
        }

        //validate with the explicit regular expression
        if (options.regexp && !isEmpty) {
            if (!options.regexp.test(options.value)) {
                return new this.ValidationResult(false, "incorrect");
            }
        }

        //validate for alphanumeric characters
        if (options.alphanumeric && !isEmpty) {
            if (!(/^[a-z0-9]+$/i.test(options.value))) {
                return new this.ValidationResult(false, "not alphanumeric");
            }
        }

        //validate for email
        if (options.email && !isEmpty) {
            if (!(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(options.value))) {
                return new this.ValidationResult(false, "not an email");
            }
        }

        //validate for url
        if (options.url && !isEmpty) {
            if (!(/^(ftp:\/\/|http:\/\/|https:\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?$/.test(options.value))) {
                return new this.ValidationResult(false, "not a url");
            }
        }

        //validate the value in a valid list
        if (options.in) {
            var valid = false;
            for (var ele in options.in) {
                if (ele == options.value) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                return new this.ValidationResult(false, "not in the valid list");
            }
        }

        //validate the valuse not in the invalid list
        if (options.notIn) {
            var valid = true;
            for (var ele in options.notIn) {
                if (ele == options.value) {
                    valid = false;
                    break;
                }
            }
            if (!valid) {
                return new this.ValidationResult(false, "in the invalid list");
            }
        }

        return new this.ValidationResult(true);
    }
};