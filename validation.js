(function ($) {
    //$("[validate]").parentsUntil('[validation-option]').each(function () {
        //var options = JSON.parse($(this).attr('[validation-option]'));
        //if (options.onchange) {
    $(document).ready(function () {
        $("[validate]").focusout(validate);
    });
        //}
    //});
    $.validate = function (FormGroupSelector) {
        var output = { isValid: true, message: "", results: [] };
        if (FormGroupSelector) {
            $(FormGroupSelector + " [validate]").each(function () {
                var res = validate({Element:this});
                if (!res.isValid) {
                    output.isValid = false;
                    output.message += "\n" + res.message;
                }
                $(output.results).append(res);
            });
        }
        return output;
    };
}(jQuery));
function OverlayMessage(result) {
    if (result.isValid) {
        $(result.control).prop("borderRestore", result.control.style.borderColor).css({ "border-color": "" });
    } else {
        $(result.control).prop("borderRestore", result.control.style.borderColor).css({ "border-color": "red" });
    }
}

function validate(opts) {
    var Element = 'object' === typeof opts ? opts.Element ? opts.Element : this : this ;
    var options = $(Element).attr("validate");
    if (options) {
        options = eval('options={' + options + '}');
        $.extend(options, { value: $(Element).val(), caption: $(Element).val()});
        var res = Validation.validate(options);
        $.extend(res, { control: Element });
        OverlayMessage(res);
        return res;
    }
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
    _callBack: function (type) {
        var ret = type.value();
        if (ret === false) {
            return new this.ValidationResult(false, type.errMessage);
        }
    },
    validate: function (options) {
        var isEmpty = false;
        //validate for mandatory
        if (options.required) {
            if (options.value == undefined)
                return new this.ValidationResult(false, "required");
            if ('object' == typeof options.value)
                return new this.ValidationResult(false, "required");
            if ('string' == typeof options.value && options.value == "")
                return new this.ValidationResult(false, "required");
        }else{
            if (options.value == undefined)
                isEmpty = true;
            if ('object' == typeof options.value)
                isEmpty = true;
            if ('string' == typeof options.value && options.value == "")
                isEmpty = true;
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

        //validate the value in a valid list
        if (options.allow) {
            var valid = false;
            for (var ele in options.allow) {
                if (ele == options.value) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                return new this.ValidationResult(false, options.errMessage ? options.errMessage : options.caption + " is not in the valid list");
            } else {
                return new this.ValidationResult(true);
            }
        }

        //validate the valuse not in the invalid list
        if (options.notAllow) {
            var valid = true;
            for (var ele in options.notAllow) {
                if (ele == options.value) {
                    valid = false;
                    break;
                }
            }
            if (!valid) {
                return new this.ValidationResult(false, options.errMessage ? options.errMessage : options.caption + " is in the invalid list");
            }
        }

        var type = {};
        if ('string' === typeof options.type) {
            type.value = options.type;
            type.errMessage = null;
        } else if (('object' === typeof options.type) && (options.type !== null)) {
            if ('function' === typeof options.type.value) {
                type.value = options.type.value;
                type.errMessage = options.type.errMessage ? options.type.errMessage : options.errMessage ? options.errMessage : options.caption + " is invalid";
                type.expr = null;
                return this._callBack(type);
            } else {
                type.value = options.type.value ? options.type.value : null;
                type.errMessage = options.type.errMessage ? options.type.errMessage : options.errMessage ? options.errMessage : null;
                type.expr = options.type.expr ? options.type.expr : null;
                type.allowContent = options.type.allowContent ? options.type.allowContent : null;
                if (options.type.notAllowContent) {
                    if ('string' === typeof options.type.notAllowContent) {
                        if (options.value.contains(options.type.notAllowContent)) {
                            return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + "some characters of " + options.caption + "are not allowd");
                        }
                    }else if ('object' === typeof options.type.notAllowContent) {
                        for (var i = 0; i < options.type.notAllowContent.length; i++) {
                            if (options.value.contains(options.type.notAllowContent[i])) {
                                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + "some characters of " + options.caption + "are not allowd");
                            }
                        }
                    }
                }
                type.IsStartWithAlpha = options.type.IsStartWithAlpha ? true : false;
            }
        } else if ('function' === typeof options.type) {
            type.value = options.type;
            type.errMessage = options.errMessage ? options.errMessage : options.caption + " is invalid";
            type.expr = null;
            return this._callBack(type);
        } else {
            type.value = null;
            type.errMessage = null;
            type.expr = null;
        }

        //validate for number
        if (type.value === 'number') {
            if (isNaN(parseFloat(options.value)) && !isFinite(options.value)) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not a number");
            }
        }

        //validate with the explicit regular expression
        if (type.value === 'regexp' && type.expr && !isEmpty) {
            if (!type.expr.test(options.value)) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is incorrect");
            }
        }

        //validate for alphanumeric characters
        if (type.value === 'alphanumeric' && !isEmpty) {
            var val = options.value;
            if (type.allowContent) {
                for (var i = 0; i < type.allowContent.length; i++) {
                    while (val.contains(type.allowContent[i])) {
                        val = val.replace(type.allowContent[i], "");
                    }
                }
            }
            if (!(/^[a-z0-9]+$/i.test(val))) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not alphanumeric");
            }
        }

        //validate for email
        if (type.value === 'email' && !isEmpty) {
            if (!(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(options.value))) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not an email");
            }
        }

        //validate for url
        if (type.value === 'url' && !isEmpty) {
            if (!(/^(ftp:\/\/|http:\/\/|https:\/\/)?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?$/.test(options.value))) {
                return new this.ValidationResult(false, type.errMessage ? type.errMessage : options.caption + " is not a url");
            }
        }

        return new this.ValidationResult(true);
    }
};